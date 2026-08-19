-- CreateEnum
CREATE TYPE "MotifPlainte" AS ENUM ('REFUS_CONSIGNE', 'PRODUIT_MANQUANT', 'PRODUIT_ENDOMMAGE', 'RETARD_LIVRAISON', 'QUALITE_SERVICE', 'AUTRE');

-- CreateEnum
CREATE TYPE "StatutPlainte" AS ENUM ('EN_ATTENTE', 'RESOLUE');

-- CreateEnum
CREATE TYPE "ActionAdminPlainte" AS ENUM ('AVERTISSEMENT', 'SUSPENSION_TEMPORAIRE', 'BANNISSEMENT');

-- CreateTable
CREATE TABLE "plaintes" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "depotId" TEXT NOT NULL,
    "referenceCommande" TEXT,
    "motif" "MotifPlainte" NOT NULL,
    "message" TEXT NOT NULL,
    "photoUrl" TEXT,
    "statut" "StatutPlainte" NOT NULL DEFAULT 'EN_ATTENTE',
    "actionAdmin" "ActionAdminPlainte",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plaintes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "plaintes" ADD CONSTRAINT "plaintes_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plaintes" ADD CONSTRAINT "plaintes_depotId_fkey" FOREIGN KEY ("depotId") REFERENCES "depots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
