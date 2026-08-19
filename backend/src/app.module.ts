import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { DepotsModule } from './depots/depots.module';
import { CatalogueModule } from './catalogue/catalogue.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    DepotsModule,
    CatalogueModule,
  ],
})
export class AppModule {}
