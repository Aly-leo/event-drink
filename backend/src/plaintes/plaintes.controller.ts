import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PlaintesService } from './plaintes.service';
import { CreatePlainteDto } from './dto/create-plainte.dto';
import { PlaintesQueryDto } from './dto/plaintes-query.dto';
import { ActionPlainteDto } from './dto/action-plainte.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@Controller('plaintes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PlaintesController {
  constructor(private readonly plaintesService: PlaintesService) {}

  @Post()
  @Roles(Role.CLIENT)
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreatePlainteDto) {
    return this.plaintesService.create(user.sub, dto);
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll(@Query() query: PlaintesQueryDto) {
    return this.plaintesService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  findOne(@Param('id') id: string) {
    return this.plaintesService.findOne(id);
  }

  @Patch(':id/resoudre')
  @Roles(Role.ADMIN)
  resoudre(@Param('id') id: string) {
    return this.plaintesService.resoudre(id);
  }

  @Patch(':id/action')
  @Roles(Role.ADMIN)
  appliquerAction(@Param('id') id: string, @Body() dto: ActionPlainteDto) {
    return this.plaintesService.appliquerAction(id, dto.action);
  }
}
