import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// Pas de connexion eager dans onModuleInit : Prisma se connecte a la
// premiere requete. Ca evite de bloquer app.listen() (donc l'ouverture
// du port) le temps que Neon se reveille apres une periode d'inactivite.
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
