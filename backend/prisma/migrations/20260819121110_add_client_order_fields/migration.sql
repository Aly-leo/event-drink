-- AlterTable
ALTER TABLE "commandes" ADD COLUMN     "adresseLivraison" TEXT,
ADD COLUMN     "instructions" TEXT;

-- AlterTable
ALTER TABLE "depots" ADD COLUMN     "visuelUrl" TEXT;
