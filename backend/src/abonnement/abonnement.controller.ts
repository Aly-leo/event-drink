import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AbonnementService } from './abonnement.service';
import { CreerPaiementAbonnementDto } from './dto/creer-paiement-abonnement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@Controller('depots/me/abonnement')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.DEPOT)
export class AbonnementController {
  constructor(private readonly abonnementService: AbonnementService) {}

  @Get()
  getMyAbonnement(@CurrentUser() user: JwtPayload) {
    return this.abonnementService.findOrCreateMyAbonnement(user.sub);
  }

  @Post('paiement')
  payer(@CurrentUser() user: JwtPayload, @Body() dto: CreerPaiementAbonnementDto) {
    return this.abonnementService.payer(user.sub, dto);
  }

  @Get('paiements')
  getMesPaiements(@CurrentUser() user: JwtPayload) {
    return this.abonnementService.findMesPaiements(user.sub);
  }
}
