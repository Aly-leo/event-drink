-- CreateEnum
CREATE TYPE "TypeMouvementStock" AS ENUM ('ENTREE', 'SORTIE');

-- CreateEnum
CREATE TYPE "PalierAbonnement" AS ENUM ('STANDARD', 'PREMIUM');

-- CreateEnum
CREATE TYPE "StatutAbonnement" AS ENUM ('ACTIF', 'EXPIRE', 'EN_ATTENTE_PAIEMENT');

-- CreateEnum
CREATE TYPE "StatutPaiement" AS ENUM ('REUSSI', 'ECHOUE');

-- CreateEnum
CREATE TYPE "OperateurPaiement" AS ENUM ('ORANGE_MONEY', 'MTN_MOMO');

-- AlterTable
ALTER TABLE "produits_depot" ADD COLUMN     "quantiteStock" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "seuilAlerte" INTEGER NOT NULL DEFAULT 5;

-- CreateTable
CREATE TABLE "mouvements_stock" (
    "id" TEXT NOT NULL,
    "produitDepotId" TEXT NOT NULL,
    "type" "TypeMouvementStock" NOT NULL,
    "quantite" INTEGER NOT NULL,
    "motif" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mouvements_stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "abonnements" (
    "id" TEXT NOT NULL,
    "depotId" TEXT NOT NULL,
    "palier" "PalierAbonnement" NOT NULL DEFAULT 'STANDARD',
    "statut" "StatutAbonnement" NOT NULL DEFAULT 'EN_ATTENTE_PAIEMENT',
    "dateRenouvellement" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "abonnements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paiements_abonnement" (
    "id" TEXT NOT NULL,
    "abonnementId" TEXT NOT NULL,
    "palier" "PalierAbonnement" NOT NULL,
    "montant" INTEGER NOT NULL,
    "operateur" "OperateurPaiement" NOT NULL,
    "numeroTelephone" TEXT NOT NULL,
    "statut" "StatutPaiement" NOT NULL,
    "reference" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "paiements_abonnement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "mouvements_stock_produitDepotId_idx" ON "mouvements_stock"("produitDepotId");

-- CreateIndex
CREATE UNIQUE INDEX "abonnements_depotId_key" ON "abonnements"("depotId");

-- CreateIndex
CREATE UNIQUE INDEX "paiements_abonnement_reference_key" ON "paiements_abonnement"("reference");

-- CreateIndex
CREATE INDEX "paiements_abonnement_abonnementId_idx" ON "paiements_abonnement"("abonnementId");

-- AddForeignKey
ALTER TABLE "mouvements_stock" ADD CONSTRAINT "mouvements_stock_produitDepotId_fkey" FOREIGN KEY ("produitDepotId") REFERENCES "produits_depot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "abonnements" ADD CONSTRAINT "abonnements_depotId_fkey" FOREIGN KEY ("depotId") REFERENCES "depots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paiements_abonnement" ADD CONSTRAINT "paiements_abonnement_abonnementId_fkey" FOREIGN KEY ("abonnementId") REFERENCES "abonnements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
