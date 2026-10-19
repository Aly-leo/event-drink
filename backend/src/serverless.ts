import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import type { IncomingMessage, ServerResponse } from 'http';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';

// L'instance Nest est conservée entre deux invocations d'une même fonction
// "chaude" : seul le premier appel (demarrage a froid) paye l'initialisation.
let cachedServer: express.Express | null = null;

async function getServer(): Promise<express.Express> {
  if (cachedServer) {
    return cachedServer;
  }
  const server = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  configureApp(app);
  await app.init();
  cachedServer = server;
  return server;
}

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const server = await getServer();
  server(req, res);
}
