import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const LOCALHOST_ORIGIN = /^https?:\/\/localhost:\d+$/;
// Couvre l'URL de prod ET toutes les URLs de preview Vercel du projet
// (event-drink-<hash>-<team>.vercel.app), qui changent à chaque déploiement.
const VERCEL_PREVIEW_ORIGIN = /^https:\/\/event-drink[a-z0-9-]*\.vercel\.app$/;

/** Config commune au serveur classique (main.ts) et à la fonction serverless Vercel. */
export function configureApp(app: INestApplication): void {
  const config = app.get(ConfigService);

  const isProd = config.get<string>('NODE_ENV') === 'production';
  const frontUrl = config.get<string>('FRONT_URL', 'http://localhost:4200');

  app.enableCors({
    origin: isProd
      ? (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
          if (!origin || origin === frontUrl || VERCEL_PREVIEW_ORIGIN.test(origin)) {
            callback(null, true);
          } else {
            callback(new Error('Origine non autorisée par la politique CORS.'), false);
          }
        }
      : LOCALHOST_ORIGIN,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
}
