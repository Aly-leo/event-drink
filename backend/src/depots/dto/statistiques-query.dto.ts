import { Type } from 'class-transformer';
import { IsIn, IsOptional } from 'class-validator';

export class StatistiquesQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsIn([7, 30, 90])
  jours?: number = 30;
}
