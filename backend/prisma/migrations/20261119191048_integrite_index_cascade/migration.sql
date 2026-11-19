-- DropForeignKey
ALTER TABLE "abonnements" DROP CONSTRAINT "abonnements_depotId_fkey";

-- DropForeignKey
ALTER TABLE "consignes" DROP CONSTRAINT "consignes_ligneCommandeId_fkey";

-- DropForeignKey
ALTER TABLE "lignes_commande" DROP CONSTRAINT "lignes_commande_commandeId_fkey";

-- DropForeignKey
ALTER TABLE "mouvements_stock" DROP CONSTRAINT "mouvements_stock_produitDepotId_fkey";

-- DropForeignKey
ALTER TABLE "paiements_abonnement" DROP CONSTRAINT "paiements_abonnement_abonnementId_fkey";

-- DropForeignKey
ALTER TABLE "password_reset_tokens" DROP CONSTRAINT "password_reset_tokens_userId_fkey";

-- DropForeignKey
ALTER TABLE "produits_depot" DROP CONSTRAINT "produits_depot_depotId_fkey";

-- CreateIndex
CREATE INDEX "avis_depotId_idx" ON "avis"("depotId");

-- CreateIndex
CREATE INDEX "commandes_clientId_idx" ON "commandes"("clientId");

-- CreateIndex
CREATE INDEX "commandes_depotId_statut_idx" ON "commandes"("depotId", "statut");

-- CreateIndex
CREATE INDEX "depots_statut_idx" ON "depots"("statut");

-- CreateIndex
CREATE INDEX "lignes_commande_commandeId_idx" ON "lignes_commande"("commandeId");

-- CreateIndex
CREATE INDEX "plaintes_depotId_statut_idx" ON "plaintes"("depotId", "statut");

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produits_depot" ADD CONSTRAINT "produits_depot_depotId_fkey" FOREIGN KEY ("depotId") REFERENCES "depots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mouvements_stock" ADD CONSTRAINT "mouvements_stock_produitDepotId_fkey" FOREIGN KEY ("produitDepotId") REFERENCES "produits_depot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes_commande" ADD CONSTRAINT "lignes_commande_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "commandes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consignes" ADD CONSTRAINT "consignes_ligneCommandeId_fkey" FOREIGN KEY ("ligneCommandeId") REFERENCES "lignes_commande"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "abonnements" ADD CONSTRAINT "abonnements_depotId_fkey" FOREIGN KEY ("depotId") REFERENCES "depots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paiements_abonnement" ADD CONSTRAINT "paiements_abonnement_abonnementId_fkey" FOREIGN KEY ("abonnementId") REFERENCES "abonnements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
