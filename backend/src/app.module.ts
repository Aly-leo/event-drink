import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { DepotsModule } from './depots/depots.module';
import { CatalogueModule } from './catalogue/catalogue.module';
import { AdminModule } from './admin/admin.module';
import { PlaintesModule } from './plaintes/plaintes.module';
import { CommandesModule } from './commandes/commandes.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    DepotsModule,
    CatalogueModule,
    AdminModule,
    PlaintesModule,
    CommandesModule,
  ],
})
export class AppModule {}
