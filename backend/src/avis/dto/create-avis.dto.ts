import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateAvisDto {
  @IsString()
  commandeId!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  note!: number;

  @IsOptional()
  @IsString()
  commentaire?: string;
}
