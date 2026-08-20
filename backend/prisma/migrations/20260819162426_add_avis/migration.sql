-- CreateTable
CREATE TABLE "avis" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "depotId" TEXT NOT NULL,
    "commandeId" TEXT NOT NULL,
    "note" INTEGER NOT NULL,
    "commentaire" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "avis_commandeId_key" ON "avis"("commandeId");

-- AddForeignKey
ALTER TABLE "avis" ADD CONSTRAINT "avis_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avis" ADD CONSTRAINT "avis_depotId_fkey" FOREIGN KEY ("depotId") REFERENCES "depots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avis" ADD CONSTRAINT "avis_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "commandes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
