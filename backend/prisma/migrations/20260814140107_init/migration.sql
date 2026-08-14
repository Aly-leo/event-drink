-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CLIENT', 'DEPOT', 'ADMIN');

-- CreateEnum
CREATE TYPE "StatutDepot" AS ENUM ('EN_ATTENTE', 'VALIDE', 'BLOQUE');

-- CreateEnum
CREATE TYPE "CategorieProduit" AS ENUM ('BIERE_LOCALE', 'BIERE_IMPORTEE', 'CHAMPAGNE_EFFERVESCENT', 'VIN', 'SANS_ALCOOL');

-- CreateEnum
CREATE TYPE "ModeReception" AS ENUM ('RETRAIT', 'LIVRAISON');

-- CreateEnum
CREATE TYPE "StatutCommande" AS ENUM ('EN_ATTENTE', 'CONFIRMEE', 'PRETE_A_RETIRER', 'EN_PREPARATION', 'EN_ROUTE', 'TERMINEE', 'LIVREE');

-- CreateEnum
CREATE TYPE "StatutConsigne" AS ENUM ('BLOQUEE', 'REMBOURSEE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "telephone" TEXT,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "depots" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "nomCommerce" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "adresse" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "modeLivraison" BOOLEAN NOT NULL DEFAULT false,
    "modeRetrait" BOOLEAN NOT NULL DEFAULT true,
    "fraisLivraison" INTEGER NOT NULL DEFAULT 0,
    "statut" "StatutDepot" NOT NULL DEFAULT 'EN_ATTENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "depots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produits" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "marque" TEXT NOT NULL,
    "contenance" TEXT NOT NULL,
    "categorie" "CategorieProduit" NOT NULL,
    "visuelUrl" TEXT,
    "estConsignable" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "produits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produits_depot" (
    "id" TEXT NOT NULL,
    "depotId" TEXT NOT NULL,
    "produitId" TEXT NOT NULL,
    "prix" INTEGER NOT NULL,
    "montantConsigne" INTEGER NOT NULL DEFAULT 0,
    "disponible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "produits_depot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commandes" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "depotId" TEXT NOT NULL,
    "mode" "ModeReception" NOT NULL,
    "statut" "StatutCommande" NOT NULL DEFAULT 'EN_ATTENTE',
    "montantTotal" INTEGER NOT NULL,
    "fraisLivraison" INTEGER NOT NULL DEFAULT 0,
    "referenceUnique" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commandes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lignes_commande" (
    "id" TEXT NOT NULL,
    "commandeId" TEXT NOT NULL,
    "produitDepotId" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL,
    "prixUnitaire" INTEGER NOT NULL,
    "montantConsigneUnitaire" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "lignes_commande_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consignes" (
    "id" TEXT NOT NULL,
    "ligneCommandeId" TEXT NOT NULL,
    "montant" INTEGER NOT NULL,
    "statut" "StatutConsigne" NOT NULL DEFAULT 'BLOQUEE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consignes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "depots_ownerId_key" ON "depots"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "produits_depot_depotId_produitId_key" ON "produits_depot"("depotId", "produitId");

-- CreateIndex
CREATE UNIQUE INDEX "commandes_referenceUnique_key" ON "commandes"("referenceUnique");

-- CreateIndex
CREATE UNIQUE INDEX "consignes_ligneCommandeId_key" ON "consignes"("ligneCommandeId");

-- AddForeignKey
ALTER TABLE "depots" ADD CONSTRAINT "depots_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produits_depot" ADD CONSTRAINT "produits_depot_depotId_fkey" FOREIGN KEY ("depotId") REFERENCES "depots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produits_depot" ADD CONSTRAINT "produits_depot_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "produits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commandes" ADD CONSTRAINT "commandes_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commandes" ADD CONSTRAINT "commandes_depotId_fkey" FOREIGN KEY ("depotId") REFERENCES "depots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes_commande" ADD CONSTRAINT "lignes_commande_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "commandes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes_commande" ADD CONSTRAINT "lignes_commande_produitDepotId_fkey" FOREIGN KEY ("produitDepotId") REFERENCES "produits_depot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consignes" ADD CONSTRAINT "consignes_ligneCommandeId_fkey" FOREIGN KEY ("ligneCommandeId") REFERENCES "lignes_commande"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
