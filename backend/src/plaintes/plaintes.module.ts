import { Module } from '@nestjs/common';
import { PlaintesController } from './plaintes.controller';
import { PlaintesService } from './plaintes.service';

@Module({
  controllers: [PlaintesController],
  providers: [PlaintesService],
})
export class PlaintesModule {}
