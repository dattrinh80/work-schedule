import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { OrganizationsController } from './organizations/organizations.controller';

@Module({
  imports: [PrismaModule, AuthModule, TasksModule],
  controllers: [OrganizationsController],
})
export class AppModule {}
