import { IsEnum } from 'class-validator';
import { ActionAdminPlainte } from '@prisma/client';

export class ActionPlainteDto {
  @IsEnum(ActionAdminPlainte)
  action!: ActionAdminPlainte;
}
