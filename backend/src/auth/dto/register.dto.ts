import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  nom!: string;

  @IsOptional()
  @IsString()
  telephone?: string;

  @IsEnum([Role.CLIENT, Role.DEPOT], {
    message: 'role doit être CLIENT ou DEPOT (le compte ADMIN est créé par seed uniquement)',
  })
  role!: typeof Role.CLIENT | typeof Role.DEPOT;
}
