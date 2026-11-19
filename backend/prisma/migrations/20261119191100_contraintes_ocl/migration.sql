-- Eventdrink : contraintes que Prisma ne sait pas exprimer (OCL -> CHECK / trigger PostgreSQL).
-- À placer dans prisma/migrations/<horodatage>_contraintes_ocl/migration.sql
-- (créée avec : npx prisma migrate dev --create-only --name contraintes_ocl), puis : npx prisma migrate deploy

-- OCL-09 : stock non négatif ; prix et consigne positifs ou nuls
ALTER TABLE "produits_depot"
  ADD CONSTRAINT "ck_pd_stock_non_negatif" CHECK ("quantiteStock" >= 0),
  ADD CONSTRAINT "ck_pd_prix_non_negatif"  CHECK ("prix" >= 0),
  ADD CONSTRAINT "ck_pd_consigne_non_negative" CHECK ("montantConsigne" >= 0),
  ADD CONSTRAINT "ck_pd_seuil_non_negatif" CHECK ("seuilAlerte" >= 0);

-- Mouvement de stock : quantité strictement positive (le sens est porté par type ENTREE/SORTIE)
ALTER TABLE "mouvements_stock"
  ADD CONSTRAINT "ck_ms_quantite_positive" CHECK ("quantite" > 0);

-- OCL-23 : quantité d'une ligne > 0 ; prix figés >= 0
ALTER TABLE "lignes_commande"
  ADD CONSTRAINT "ck_lc_quantite_positive" CHECK ("quantite" > 0),
  ADD CONSTRAINT "ck_lc_prix_non_negatif" CHECK ("prixUnitaire" >= 0),
  ADD CONSTRAINT "ck_lc_consigne_non_negative" CHECK ("montantConsigneUnitaire" >= 0);

ALTER TABLE "consignes"
  ADD CONSTRAINT "ck_consigne_montant_non_negatif" CHECK ("montant" >= 0);

-- OCL-21 (format de référence) + montants + OCL-27 (statut cohérent avec le mode)
ALTER TABLE "commandes"
  ADD CONSTRAINT "ck_cmd_reference_format" CHECK ("referenceUnique" ~ '^FAC-[0-9]{4}-[0-9]{4}$'),
  ADD CONSTRAINT "ck_cmd_montants_non_negatifs" CHECK ("montantTotal" >= 0 AND "fraisLivraison" >= 0),
  ADD CONSTRAINT "ck_cmd_statut_selon_mode" CHECK (
    ("mode"::text = 'RETRAIT'   AND "statut"::text IN ('EN_ATTENTE','CONFIRMEE','PRETE_A_RETIRER','TERMINEE'))
 OR ("mode"::text = 'LIVRAISON' AND "statut"::text IN ('EN_ATTENTE','CONFIRMEE','EN_PREPARATION','EN_ROUTE','LIVREE'))
  );

-- OCL-35 (partie note) : note de 1 à 5
ALTER TABLE "avis"
  ADD CONSTRAINT "ck_avis_note_1_5" CHECK ("note" BETWEEN 1 AND 5);

-- OCL-36 : montant selon le palier (STANDARD 5000 / PREMIUM 10000) et format de référence
ALTER TABLE "paiements_abonnement"
  ADD CONSTRAINT "ck_pay_montant_selon_palier" CHECK (
    ("palier"::text = 'STANDARD' AND "montant" = 5000)
 OR ("palier"::text = 'PREMIUM'  AND "montant" = 10000)),
  ADD CONSTRAINT "ck_pay_reference_format" CHECK ("reference" ~ '^PAY-[0-9]{4}-[0-9]{4}$'),
  ADD CONSTRAINT "ck_pay_numero_cameroun" CHECK ("numeroTelephone" ~ '^(\+237)?6[0-9]{8}$');  -- OCL-37

-- Dépôt : au moins un mode actif, frais >= 0, coordonnées valides
ALTER TABLE "depots"
  ADD CONSTRAINT "ck_depot_au_moins_un_mode" CHECK ("modeLivraison" OR "modeRetrait"),
  ADD CONSTRAINT "ck_depot_frais_non_negatifs" CHECK ("fraisLivraison" >= 0),
  ADD CONSTRAINT "ck_depot_coordonnees" CHECK ("latitude" BETWEEN -90 AND 90 AND "longitude" BETWEEN -180 AND 180);

-- OCL-35 (partie dépôt) : l'avis porte sur le dépôt de la commande
CREATE OR REPLACE FUNCTION fn_avis_depot_coherent() RETURNS trigger AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "commandes" c WHERE c."id" = NEW."commandeId" AND c."depotId" = NEW."depotId") THEN
    RAISE EXCEPTION 'OCL-35 : avis.depotId doit être le dépôt de la commande %', NEW."commandeId"
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_avis_depot_coherent
  BEFORE INSERT OR UPDATE OF "commandeId", "depotId" ON "avis"
  FOR EACH ROW EXECUTE FUNCTION fn_avis_depot_coherent();

-- OCL-26 : montant de la consigne = consigne unitaire x quantité de la ligne
CREATE OR REPLACE FUNCTION fn_consigne_montant() RETURNS trigger AS $$
BEGIN
  IF NEW."montant" <> (SELECT l."montantConsigneUnitaire" * l."quantite" FROM "lignes_commande" l WHERE l."id" = NEW."ligneCommandeId") THEN
    RAISE EXCEPTION 'OCL-26 : montant de consigne incohérent avec la ligne %', NEW."ligneCommandeId"
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_consigne_montant
  BEFORE INSERT OR UPDATE OF "montant", "ligneCommandeId" ON "consignes"
  FOR EACH ROW EXECUTE FUNCTION fn_consigne_montant();
