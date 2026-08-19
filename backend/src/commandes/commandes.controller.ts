import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CommandesService } from './commandes.service';
import { CreateCommandeDto } from './dto/create-commande.dto';
import { UpdateStatutCommandeDto } from './dto/update-statut-commande.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@Controller('commandes')
@UseGuards(JwtAuthGuard)
export class CommandesController {
  constructor(private readonly commandesService: CommandesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.CLIENT)
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateCommandeDto) {
    return this.commandesService.create(user.sub, dto);
  }

  @Get('mine')
  @UseGuards(RolesGuard)
  @Roles(Role.CLIENT)
  findMine(@CurrentUser() user: JwtPayload) {
    return this.commandesService.findMine(user.sub);
  }

  @Get('depot/mine')
  @UseGuards(RolesGuard)
  @Roles(Role.DEPOT)
  findForMyDepot(@CurrentUser() user: JwtPayload) {
    return this.commandesService.findForMyDepot(user.sub);
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.commandesService.findOne(user.sub, user.role, id);
  }

  @Patch(':id/statut')
  @UseGuards(RolesGuard)
  @Roles(Role.DEPOT)
  updateStatut(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateStatutCommandeDto
  ) {
    return this.commandesService.updateStatut(user.sub, id, dto.statut);
  }
}
