// Point d'entree de la fonction serverless Vercel : le code reel est compile
// par `nest build` dans dist/ (voir src/serverless.ts).
module.exports = require('../dist/serverless').default;
