import { Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AdminService } from './admin.service';
import { DepotsAdminQueryDto } from './dto/depots-admin-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Get('depots')
  getDepots(@Query() query: DepotsAdminQueryDto) {
    return this.adminService.getDepots(query);
  }

  @Patch('depots/:id/valider')
  validerDepot(@Param('id') id: string) {
    return this.adminService.validerDepot(id);
  }

  @Patch('depots/:id/bloquer')
  bloquerDepot(@Param('id') id: string) {
    return this.adminService.bloquerDepot(id);
  }
}
