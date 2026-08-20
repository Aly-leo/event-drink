import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateUserInput {
  email: string;
  password: string;
  nom: string;
  telephone?: string;
  role: Role;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  create(data: CreateUserInput) {
    return this.prisma.user.create({ data });
  }

  update(id: string, data: Partial<Pick<CreateUserInput, 'nom' | 'telephone' | 'email'>> & { adresse?: string }) {
    return this.prisma.user.update({ where: { id }, data });
  }
}
