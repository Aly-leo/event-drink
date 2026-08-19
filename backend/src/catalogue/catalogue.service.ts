import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProduitDto } from './dto/create-produit.dto';
import { UpdateProduitDto } from './dto/update-produit.dto';

@Injectable()
export class CatalogueService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.produit.findMany({ orderBy: { nom: 'asc' } });
  }

  create(dto: CreateProduitDto) {
    return this.prisma.produit.create({ data: dto });
  }

  async update(id: string, dto: UpdateProduitDto) {
    const produit = await this.prisma.produit.findUnique({ where: { id } });
    if (!produit) {
      throw new NotFoundException('Produit introuvable.');
    }
    return this.prisma.produit.update({ where: { id }, data: dto });
  }
}
