import { PrismaClient, CategorieProduit, Role, StatutDepot } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const PASSWORD = 'Password123!';

async function hash(password: string) {
  return bcrypt.hash(password, 10);
}

const PRODUITS: Array<{
  nom: string;
  marque: string;
  contenance: string;
  categorie: CategorieProduit;
  estConsignable: boolean;
}> = [
  { nom: 'Castel Beer', marque: 'Castel', contenance: '65cl bouteille', categorie: 'BIERE_LOCALE', estConsignable: true },
  { nom: 'Castel Beer', marque: 'Castel', contenance: '33cl canette', categorie: 'BIERE_LOCALE', estConsignable: false },
  { nom: '33 Export', marque: 'Brasseries du Cameroun', contenance: '65cl bouteille', categorie: 'BIERE_LOCALE', estConsignable: true },
  { nom: 'Mützig', marque: 'Brasseries du Cameroun', contenance: '65cl bouteille', categorie: 'BIERE_LOCALE', estConsignable: true },
  { nom: 'Beaufort', marque: 'Guinness Cameroun', contenance: '65cl bouteille', categorie: 'BIERE_LOCALE', estConsignable: true },
  { nom: 'Guinness Foreign Extra', marque: 'Guinness Cameroun', contenance: '60cl bouteille', categorie: 'BIERE_LOCALE', estConsignable: true },
  { nom: 'Heineken', marque: 'Heineken', contenance: '33cl canette', categorie: 'BIERE_IMPORTEE', estConsignable: false },
  { nom: 'Desperados', marque: 'Heineken', contenance: '33cl bouteille', categorie: 'BIERE_IMPORTEE', estConsignable: false },
  { nom: 'Corona Extra', marque: 'AB InBev', contenance: '35cl bouteille', categorie: 'BIERE_IMPORTEE', estConsignable: false },
  { nom: 'Moët & Chandon Brut', marque: 'Moët & Chandon', contenance: '75cl bouteille', categorie: 'CHAMPAGNE_EFFERVESCENT', estConsignable: false },
  { nom: 'Veuve Clicquot', marque: 'Veuve Clicquot', contenance: '75cl bouteille', categorie: 'CHAMPAGNE_EFFERVESCENT', estConsignable: false },
  { nom: 'Rosé d’Anjou', marque: 'Maison Ackerman', contenance: '75cl bouteille', categorie: 'VIN', estConsignable: false },
  { nom: 'Cabernet Sauvignon', marque: 'Maison Ackerman', contenance: '75cl bouteille', categorie: 'VIN', estConsignable: false },
  { nom: "D'jino Orange", marque: 'Source du Pays', contenance: '65cl bouteille', categorie: 'SANS_ALCOOL', estConsignable: false },
  { nom: 'Top Pamplemousse', marque: 'Société des Boissons du Cameroun', contenance: '60cl bouteille', categorie: 'SANS_ALCOOL', estConsignable: false },
  { nom: 'Supermont', marque: 'Source du Pays', contenance: '1.5L', categorie: 'SANS_ALCOOL', estConsignable: false },
  { nom: 'Malta Guinness', marque: 'Guinness Cameroun', contenance: '33cl canette', categorie: 'SANS_ALCOOL', estConsignable: false },
];

async function main() {
  console.log('Seed: catalogue central...');
  const produits = [];
  for (const p of PRODUITS) {
    produits.push(
      await prisma.produit.create({
        data: {
          nom: p.nom,
          marque: p.marque,
          contenance: p.contenance,
          categorie: p.categorie,
          estConsignable: p.estConsignable,
        },
      })
    );
  }

  console.log('Seed: comptes de test...');
  const adminPassword = await hash(PASSWORD);
  await prisma.user.create({
    data: {
      email: 'admin@eventdrink.test',
      password: adminPassword,
      nom: 'Admin Eventdrink',
      role: Role.ADMIN,
    },
  });

  const clientPassword = await hash(PASSWORD);
  await prisma.user.create({
    data: {
      email: 'client@eventdrink.test',
      password: clientPassword,
      nom: 'Client Démo',
      telephone: '+237600000001',
      role: Role.CLIENT,
    },
  });

  const depotsSeed = [
    {
      email: 'depot1@eventdrink.test',
      nom: 'Depot Centrale Akwa',
      nomCommerce: 'Depot Centrale Akwa',
      telephone: '+237600000002',
      adresse: 'Boulevard de la Liberté, Akwa, Douala',
      latitude: 4.0511,
      longitude: 9.7015,
      modeLivraison: true,
      modeRetrait: true,
      fraisLivraison: 500,
      statut: StatutDepot.VALIDE,
    },
    {
      email: 'depot2@eventdrink.test',
      nom: 'Distri-Boissons Deido',
      nomCommerce: 'Distri-Boissons Deido',
      telephone: '+237600000003',
      adresse: 'Rue des Écoles, Deido, Douala',
      latitude: 4.0669,
      longitude: 9.7124,
      modeLivraison: true,
      modeRetrait: true,
      fraisLivraison: 1000,
      statut: StatutDepot.VALIDE,
    },
    {
      email: 'depot3@eventdrink.test',
      nom: 'Depot Central Yaoundé',
      nomCommerce: 'Depot Central Yaoundé',
      telephone: '+237600000004',
      adresse: 'Carrefour Ndokoti, Yaoundé',
      latitude: 3.8667,
      longitude: 11.5167,
      modeLivraison: false,
      modeRetrait: true,
      fraisLivraison: 0,
      statut: StatutDepot.EN_ATTENTE,
    },
  ];

  for (const d of depotsSeed) {
    const owner = await prisma.user.create({
      data: {
        email: d.email,
        password: await hash(PASSWORD),
        nom: d.nomCommerce,
        telephone: d.telephone,
        role: Role.DEPOT,
      },
    });

    const depot = await prisma.depot.create({
      data: {
        ownerId: owner.id,
        nomCommerce: d.nomCommerce,
        telephone: d.telephone,
        adresse: d.adresse,
        latitude: d.latitude,
        longitude: d.longitude,
        modeLivraison: d.modeLivraison,
        modeRetrait: d.modeRetrait,
        fraisLivraison: d.fraisLivraison,
        statut: d.statut,
      },
    });

    // Chaque dépôt sélectionne un sous-ensemble du catalogue avec son propre prix/consigne.
    const selection = produits.slice(0, 6 + depotsSeed.indexOf(d));
    for (const produit of selection) {
      await prisma.produitDepot.create({
        data: {
          depotId: depot.id,
          produitId: produit.id,
          prix: 1000 + Math.round(Math.random() * 12000),
          montantConsigne: produit.estConsignable ? 150 : 0,
          disponible: true,
        },
      });
    }
  }

  console.log('Seed terminé.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
