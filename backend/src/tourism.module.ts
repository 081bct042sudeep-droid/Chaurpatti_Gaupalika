import { Module } from '@nestjs/common';
import { AppealsModule } from './appeals.module';
import { PrismaModule } from './prisma.module';
import { TourismController } from './tourism.controller';
import { TourismService } from './tourism.service';

@Module({ imports: [PrismaModule, AppealsModule], controllers: [TourismController], providers: [TourismService] })
export class TourismModule {}
