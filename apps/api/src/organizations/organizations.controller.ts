import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { PrismaService } from '../prisma/prisma.service';
import { Facility, User } from '@wms/shared';

@Controller('api/v1')
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('facilities')
  async getFacilities(): Promise<{ facilities: Facility[] }> {
    const facilities = Array.from(this.prisma.store.facilities.values()).filter(
      (f) => f.isActive,
    );
    return { facilities };
  }

  @Get('users')
  async getUsers(): Promise<{ users: User[] }> {
    const users = Array.from(this.prisma.store.users.values())
      .filter((u) => u.isActive)
      .map(({ passwordHash: _, ...safeUser }) => safeUser);
    return { users };
  }
}
