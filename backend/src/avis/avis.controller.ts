import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AvisService } from './avis.service';
import { CreateAvisDto } from './dto/create-avis.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@Controller('avis')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AvisController {
  constructor(private readonly avisService: AvisService) {}

  @Post()
  @Roles(Role.CLIENT)
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateAvisDto) {
    return this.avisService.create(user.sub, dto);
  }
}
