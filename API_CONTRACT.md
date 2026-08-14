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

## Squelette des routes à venir (Jour 2-4)

> Non implémentées au Jour 1 — formes indicatives pour que Carmen/Nadia puissent mocker dès maintenant. Peuvent évoluer légèrement une fois codées ; ce fichier sera mis à jour à chaque implémentation réelle.

### Dépôts & catalogue (Jour 2)

`GET /depots?lat=4.05&lng=9.70&rayonKm=5&tri=distance` — liste des dépôts validés à proximité.
```json
[
  {
    "id": "clx...",
    "nomCommerce": "Depot Centrale Akwa",
    "adresse": "Boulevard de la Liberté, Akwa, Douala",
    "latitude": 4.0511,
    "longitude": 9.7015,
    "distanceKm": 1.2,
    "modeLivraison": true,
    "modeRetrait": true,
    "fraisLivraison": 500,
    "statut": "VALIDE"
  }
]
```

`GET /depots/:id` — détail d'un dépôt + son catalogue (`ProduitDepot[]` avec `produit` inclus).

`GET /catalogue/produits` — catalogue central (admin + sélection dépôt).
```json
[
  {
    "id": "clx...",
    "nom": "Castel Beer",
    "marque": "Castel",
    "contenance": "65cl bouteille",
    "categorie": "BIERE_LOCALE",
    "estConsignable": true
  }
]
```

`POST /catalogue/produits` (ADMIN) — créer une fiche produit.
`PATCH /catalogue/produits/:id` (ADMIN) — modifier une fiche produit.

`POST /depots/:id/produits` (DEPOT, propriétaire) — sélectionner un produit du catalogue central avec prix/consigne :
```json
{ "produitId": "clx...", "prix": 7200, "montantConsigne": 150 }
```

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
