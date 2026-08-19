# Eventdrink — Contrat d'API

> Source de vérité des routes REST entre le front Angular et le back NestJS. Toute nouvelle route ou changement de format = mise à jour de ce fichier + message à l'équipe.

Base URL dev : `http://localhost:3000`
Toutes les routes sauf `/auth/register` et `/auth/login` nécessitent le header :
```
Authorization: Bearer <accessToken>
```

Format d'erreur standard (NestJS `ValidationPipe` / exceptions HTTP) :
```json
{
  "statusCode": 400,
  "message": "email must be an email" ,
  "error": "Bad Request"
}
```
`message` peut être une chaîne ou un tableau de chaînes (erreurs de validation multiples).

---

## Auth — implémenté (Jour 1)

### `POST /auth/register`
Crée un compte `CLIENT` ou `DEPOT` (le rôle `ADMIN` n'est jamais créable ici — seed uniquement).

Request :
```json
{
  "email": "marie@example.com",
  "password": "motdepasse123",
  "nom": "Marie Fotso",
  "telephone": "+237600000000",
  "role": "CLIENT"
}
```
`telephone` optionnel. `password` : 8 caractères minimum. `role` : `"CLIENT" | "DEPOT"`.

Response `201` :
```json
{
  "accessToken": "eyJhbGciOi...",
  "user": {
    "id": "clx1a2b3c...",
    "email": "marie@example.com",
    "nom": "Marie Fotso",
    "telephone": "+237600000000",
    "role": "CLIENT",
    "createdAt": "2026-08-14T10:00:00.000Z"
  }
}
```
Erreurs : `409 Conflict` si l'email existe déjà.

### `POST /auth/login`
Request :
```json
{ "email": "marie@example.com", "password": "motdepasse123" }
```
Response `200` : même forme que `register` (`accessToken` + `user`).
Erreurs : `401 Unauthorized` si email/mot de passe invalide.

### `GET /auth/me`
Protégé (JWT). Retourne l'utilisateur courant (sans le hash du mot de passe).

Response `200` :
```json
{
  "id": "clx1a2b3c...",
  "email": "marie@example.com",
  "nom": "Marie Fotso",
  "telephone": "+237600000000",
  "role": "CLIENT",
  "createdAt": "2026-08-14T10:00:00.000Z"
}
```

### Payload du JWT
```json
{ "sub": "<userId>", "email": "marie@example.com", "role": "CLIENT" }
```
Expiration par défaut : 7 jours (dev). Le front décode `user.role` depuis la réponse de login/register (pas besoin de décoder le JWT côté client).

### Comptes de test (seed)
Mot de passe pour tous : `Password123!`

| Email | Rôle |
|---|---|
| `admin@eventdrink.test` | ADMIN |
| `client@eventdrink.test` | CLIENT |
| `depot1@eventdrink.test` | DEPOT (Depot Centrale Akwa — VALIDE) |
| `depot2@eventdrink.test` | DEPOT (Distri-Boissons Deido — VALIDE) |
| `depot3@eventdrink.test` | DEPOT (Depot Central Yaoundé — EN_ATTENTE) |

---

## Dépôts & catalogue — implémenté (Jour 2)

Toutes les routes ci-dessous nécessitent le header `Authorization` comme les autres (JWT).

### `GET /depots?lat=&lng=&rayonKm=&tri=distance`
Liste des dépôts `statut: VALIDE` uniquement. `lat`/`lng`/`rayonKm` optionnels (nombres). Si `lat`/`lng` fournis, `distanceKm` est calculé (haversine) et le tri par distance s'applique automatiquement (ou explicitement via `tri=distance`). `rayonKm` filtre les résultats si fourni.
```json
[
  {
    "id": "clx...",
    "ownerId": "clx...",
    "nomCommerce": "Depot Centrale Akwa",
    "telephone": "+237600000002",
    "adresse": "Boulevard de la Liberté, Akwa, Douala",
    "latitude": 4.0511,
    "longitude": 9.7015,
    "modeLivraison": true,
    "modeRetrait": true,
    "fraisLivraison": 500,
    "statut": "VALIDE",
    "createdAt": "2026-08-14T14:01:49.741Z",
    "distanceKm": 1.2
  }
]
```
`distanceKm` vaut `null` si `lat`/`lng` non fournis.

### `GET /depots/:id`
Détail d'un dépôt (n'importe quel statut) + son catalogue. 404 si introuvable.
```json
{
  "id": "clx...",
  "nomCommerce": "Depot Centrale Akwa",
  "...": "...",
  "produits": [
    {
      "id": "clx...",
      "depotId": "clx...",
      "produitId": "clx...",
      "prix": 7200,
      "montantConsigne": 150,
      "disponible": true,
      "produit": { "id": "clx...", "nom": "Castel Beer", "...": "..." }
    }
  ]
}
```

### `GET /depots/me` — rôle `DEPOT`
Le dépôt du compte connecté (résolu par `ownerId`). Renvoie `null` si pas encore de dépôt (utile pour détecter si l'inscription dépôt reste à faire).

### `GET /depots/me/produits` — rôle `DEPOT`
`ProduitDepot[]` (avec `produit` inclus) du dépôt du compte connecté. 404 si pas de dépôt associé.

### `POST /depots/me/produits` — rôle `DEPOT`
Ajoute un produit du catalogue central au catalogue du dépôt connecté.
```json
{ "produitId": "clx...", "prix": 7200, "montantConsigne": 150, "disponible": true }
```
`montantConsigne` et `disponible` optionnels (défauts `0` / `true`). Réponse `201` avec `produit` inclus.
Erreurs : `404` si pas de dépôt associé au compte, `409 Conflict` si ce produit est déjà dans le catalogue du dépôt.

### `PATCH /depots/me/produits/:produitDepotId` — rôle `DEPOT`
```json
{ "prix": 7500, "disponible": false }
```
Tous les champs optionnels. 404 si l'entrée n'existe pas **ou** n'appartient pas au dépôt du compte connecté (jamais 403, pour ne pas confirmer l'existence chez un autre dépôt).

### `GET /catalogue/produits`
Catalogue central complet, tout rôle authentifié.
```json
[
  {
    "id": "clx...",
    "nom": "Castel Beer",
    "marque": "Castel",
    "contenance": "65cl bouteille",
    "categorie": "BIERE_LOCALE",
    "visuelUrl": null,
    "estConsignable": true,
    "createdAt": "2026-08-14T14:01:48.077Z"
  }
]
```
Valeurs possibles de `categorie` : `BIERE_LOCALE`, `BIERE_IMPORTEE`, `CHAMPAGNE_EFFERVESCENT`, `VIN`, `SANS_ALCOOL`.

### `POST /catalogue/produits` — rôle `ADMIN`
```json
{
  "nom": "Castel Beer",
  "marque": "Castel",
  "contenance": "65cl bouteille",
  "categorie": "BIERE_LOCALE",
  "visuelUrl": "https://...",
  "estConsignable": true
}
```
`visuelUrl` optionnel. Réponse `201`. `403 Forbidden` pour tout rôle autre qu'ADMIN.

### `PATCH /catalogue/produits/:id` — rôle `ADMIN`
Mêmes champs que `POST`, tous optionnels. `404` si produit introuvable.

---

## Admin & Plaintes — implémenté

> Construit en avance sur le planning jour-par-jour (dashboard admin complet). Pas de vrai upload de fichier : `photoUrl` reste un champ URL texte.

### `GET /admin/stats` — rôle `ADMIN`
```json
{
  "depotsActifs": 2,
  "depotsEnAttente": 1,
  "chiffreAffairesTotal": 0,
  "consignesActives": 0,
  "plaintesEnAttente": 2
}
```
`chiffreAffairesTotal` (somme de `Commande.montantTotal`) et `consignesActives` (somme de `Consigne.montant` où `statut: BLOQUEE`) sont de vraies agrégations Prisma — elles resteront à `0` tant que le flux commandes (Jour 3-4) n'existe pas, ce ne sont pas des valeurs figées.

### `GET /admin/depots?statut=` — rôle `ADMIN`
Tous les dépôts, tout statut confondu (filtrable), pour la gestion. Distinct de `GET /depots` (public, VALIDE uniquement). Même format de réponse que `GET /depots`, sans `distanceKm`.

### `PATCH /admin/depots/:id/valider` — rôle `ADMIN`
Statut → `VALIDE`. 404 si dépôt introuvable.

### `PATCH /admin/depots/:id/bloquer` — rôle `ADMIN`
Statut → `BLOQUE`. 404 si dépôt introuvable. Utilisé aussi bien pour rejeter un dépôt en attente que pour bloquer un dépôt déjà validé.

### `POST /plaintes` — rôle `CLIENT`
```json
{
  "depotId": "clx...",
  "referenceCommande": "FAC-2026-8942",
  "motif": "REFUS_CONSIGNE",
  "message": "...",
  "photoUrl": "https://..."
}
```
`referenceCommande` et `photoUrl` optionnels. `motif` : `REFUS_CONSIGNE` \| `PRODUIT_MANQUANT` \| `PRODUIT_ENDOMMAGE` \| `RETARD_LIVRAISON` \| `QUALITE_SERVICE` \| `AUTRE`. `clientId` pris du JWT, jamais du body. 404 si `depotId` inconnu. Réponse `201`.

### `GET /plaintes?statut=&depotId=` — rôle `ADMIN`
```json
[
  {
    "id": "clx...",
    "referenceCommande": "FAC-2026-8942",
    "motif": "REFUS_CONSIGNE",
    "message": "...",
    "photoUrl": null,
    "statut": "EN_ATTENTE",
    "actionAdmin": null,
    "createdAt": "2026-08-14T14:35:04.628Z",
    "client": { "id": "clx...", "nom": "Client Démo", "email": "client@eventdrink.test" },
    "depot": { "id": "clx...", "nomCommerce": "Depot Centrale Akwa" }
  }
]
```

### `GET /plaintes/:id` — rôle `ADMIN`
Même forme, une seule plainte. 404 si introuvable.

### `PATCH /plaintes/:id/resoudre` — rôle `ADMIN`
Statut → `RESOLUE`.

### `PATCH /plaintes/:id/action` — rôle `ADMIN`
```json
{ "action": "AVERTISSEMENT" }
```
`action` : `AVERTISSEMENT` \| `SUSPENSION_TEMPORAIRE` \| `BANNISSEMENT`. Enregistre `actionAdmin` sur la plainte. Si `SUSPENSION_TEMPORAIRE` ou `BANNISSEMENT`, bascule aussi automatiquement le dépôt lié en `statut: BLOQUE`.

---

## Commandes — implémenté

### `POST /commandes` — rôle `CLIENT`
```json
{
  "depotId": "clx...",
  "mode": "LIVRAISON",
  "adresseLivraison": "15 Rue de la Paix, Akwa, Douala",
  "instructions": "Code digicode 1234",
  "lignes": [
    { "produitDepotId": "clx...", "quantite": 2 }
  ]
}
```
`adresseLivraison` obligatoire si `mode: "LIVRAISON"` (400 sinon), `instructions` toujours optionnel. `mode` doit être supporté par le dépôt (`modeLivraison`/`modeRetrait`), sinon 400. Chaque `produitDepotId` doit appartenir à `depotId` et être `disponible` (sinon 400 — jamais confiance dans un prix envoyé par le client, toujours recalculé depuis le `ProduitDepot`).

Réponse `201` — `Commande` complète :
```json
{
  "id": "clx...",
  "clientId": "clx...",
  "depotId": "clx...",
  "depot": { "id": "clx...", "nomCommerce": "...", "telephone": "...", "adresse": "..." },
  "mode": "LIVRAISON",
  "statut": "EN_ATTENTE",
  "montantTotal": 9277,
  "fraisLivraison": 500,
  "referenceUnique": "FAC-2026-8942",
  "adresseLivraison": "15 Rue de la Paix, Akwa, Douala",
  "instructions": "Code digicode 1234",
  "createdAt": "2026-08-19T14:29:00.000Z",
  "lignes": [
    {
      "id": "clx...",
      "produitDepotId": "clx...",
      "produitDepot": { "id": "clx...", "prix": 2782, "montantConsigne": 150, "produit": { "nom": "Castel Beer", "...": "..." } },
      "quantite": 2,
      "prixUnitaire": 2782,
      "montantConsigneUnitaire": 150,
      "consigne": { "id": "clx...", "montant": 300, "statut": "BLOQUEE" }
    }
  ]
}
```
`montantTotal` = Σ(prix×qté) + Σ(consigne×qté) + frais de livraison (si mode LIVRAISON). Une `Consigne` (`BLOQUEE`) est créée pour chaque ligne dont `montantConsigneUnitaire > 0`. `referenceUnique` au format `FAC-{année}-{4 chiffres}`, garanti unique (retry automatique sur collision).

### `GET /commandes/mine` — rôle `CLIENT`
Historique du client connecté (`Commande[]`, même forme que ci-dessus), tri `createdAt desc`.

### `GET /commandes/:id`
Tout rôle authentifié. Le service vérifie l'appartenance (`CLIENT` → doit être le sien, `DEPOT` → doit posséder le dépôt lié, `ADMIN` → toujours autorisé). **404** (jamais 403) si non autorisé.

### `GET /commandes/depot/mine` — rôle `DEPOT`
Commandes reçues par le dépôt du compte connecté (résolu via `ownerId`, jamais un `depotId` arbitraire).

### `PATCH /commandes/:id/statut` — rôle `DEPOT`
```json
{ "statut": "CONFIRMEE" }
```
Vérifie la propriété du dépôt et que la transition respecte la séquence du `mode` (`RETRAIT` : `EN_ATTENTE → CONFIRMEE → PRETE_A_RETIRER → TERMINEE` ; `LIVRAISON` : `EN_ATTENTE → CONFIRMEE → EN_PREPARATION → EN_ROUTE → LIVREE`). 400 si la transition saute une étape.

---

## Squelette des routes à venir (Jour 4)

> Non implémentées — formes indicatives. Ce fichier sera mis à jour à chaque implémentation réelle.

### Consigne (Jour 4, version light)

`GET /consignes?depotId=...` (DEPOT) — consignes `BLOQUEE` dues.
`PATCH /consignes/:id/restituer` (DEPOT) — passe le statut à `REMBOURSEE`.

---

## Règles de cloisonnement (rappel)

Toute route `DEPOT` filtre systématiquement par `ownerId: req.user.sub` côté service NestJS — jamais uniquement côté Angular. Un dépôt ne doit jamais pouvoir lire ou modifier les données d'un autre dépôt, y compris en devinant un `id`.
