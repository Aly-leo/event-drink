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

## Squelette des routes à venir (Jour 3-4)

> Non implémentées — formes indicatives pour que Carmen/Nadia puissent mocker dès maintenant. Ce fichier sera mis à jour à chaque implémentation réelle.

### Commandes (Jour 3-4)

`POST /commandes` (CLIENT) :
```json
{
  "depotId": "clx...",
  "mode": "LIVRAISON",
  "lignes": [
    { "produitDepotId": "clx...", "quantite": 2 }
  ]
}
```
Réponse : `Commande` avec `montantTotal` calculé côté serveur (prix + consignes + frais livraison), `referenceUnique` générée (`FAC-2026-xxxx`).

`GET /commandes/mine` (CLIENT) — historique du client courant.
`GET /commandes?depotId=...` (DEPOT, propriétaire) — commandes reçues par le dépôt.
`PATCH /commandes/:id/statut` (DEPOT) :
```json
{ "statut": "CONFIRMEE" }
```
Valeurs `statut` selon le mode (`RETRAIT` : `EN_ATTENTE → CONFIRMEE → PRETE_A_RETIRER → TERMINEE` ; `LIVRAISON` : `EN_ATTENTE → CONFIRMEE → EN_PREPARATION → EN_ROUTE → LIVREE`).

### Consigne (Jour 4, version light)

`GET /consignes?depotId=...` (DEPOT) — consignes `BLOQUEE` dues.
`PATCH /consignes/:id/restituer` (DEPOT) — passe le statut à `REMBOURSEE`.

### Admin (Jour 2-3)

`GET /admin/depots?statut=EN_ATTENTE` — file de validation.
`PATCH /admin/depots/:id/valider` / `PATCH /admin/depots/:id/bloquer`.
`GET /admin/stats` — compteurs simples (nb dépôts, nb commandes, etc.).

---

## Règles de cloisonnement (rappel)

Toute route `DEPOT` filtre systématiquement par `ownerId: req.user.sub` côté service NestJS — jamais uniquement côté Angular. Un dépôt ne doit jamais pouvoir lire ou modifier les données d'un autre dépôt, y compris en devinant un `id`.
