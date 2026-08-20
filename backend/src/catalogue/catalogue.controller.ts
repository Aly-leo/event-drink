import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CatalogueService } from './catalogue.service';
import { CreateProduitDto } from './dto/create-produit.dto';
import { UpdateProduitDto } from './dto/update-produit.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('catalogue')
@UseGuards(JwtAuthGuard)
export class CatalogueController {
  constructor(private readonly catalogueService: CatalogueService) {}

  @Get('produits')
  findAll() {
    return this.catalogueService.findAll();
  }

  @Post('produits')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateProduitDto) {
    return this.catalogueService.create(dto);
  }

  @Patch('produits/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateProduitDto) {
    return this.catalogueService.update(id, dto);
  }
}
