import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { AppealsController } from './appeals.controller';
import { AppealsService } from './appeals.service';

@Module({
  controllers: [AppealsController],
  providers: [PrismaService, AppealsService],
  exports: [AppealsService],
})
export class AppealsModule {}
