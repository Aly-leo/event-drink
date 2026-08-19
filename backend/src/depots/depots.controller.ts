import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { DepotsService } from './depots.service';
import { DepotsQueryDto } from './dto/depots-query.dto';
import { AddProduitDepotDto } from './dto/add-produit-depot.dto';
import { UpdateProduitDepotDto } from './dto/update-produit-depot.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@Controller('depots')
@UseGuards(JwtAuthGuard)
export class DepotsController {
  constructor(private readonly depotsService: DepotsService) {}

  @Get('me')
  @UseGuards(RolesGuard)
  @Roles(Role.DEPOT)
  getMyDepot(@CurrentUser() user: JwtPayload) {
    return this.depotsService.findMyDepot(user.sub);
  }

  @Get('me/produits')
  @UseGuards(RolesGuard)
  @Roles(Role.DEPOT)
  getMyProduits(@CurrentUser() user: JwtPayload) {
    return this.depotsService.findMyProduits(user.sub);
  }

  @Post('me/produits')
  @UseGuards(RolesGuard)
  @Roles(Role.DEPOT)
  addMyProduit(@CurrentUser() user: JwtPayload, @Body() dto: AddProduitDepotDto) {
    return this.depotsService.addMyProduit(user.sub, dto);
  }

  @Patch('me/produits/:produitDepotId')
  @UseGuards(RolesGuard)
  @Roles(Role.DEPOT)
  updateMyProduit(
    @CurrentUser() user: JwtPayload,
    @Param('produitDepotId') produitDepotId: string,
    @Body() dto: UpdateProduitDepotDto
  ) {
    return this.depotsService.updateMyProduit(user.sub, produitDepotId, dto);
  }

  @Get()
  findAll(@Query() query: DepotsQueryDto) {
    return this.depotsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.depotsService.findOne(id);
  }
}
