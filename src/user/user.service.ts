import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getUser(filter: Prisma.UserWhereUniqueInput) {
    return this.prisma.user.findUniqueOrThrow({
      where: filter,
    });
  }
}
