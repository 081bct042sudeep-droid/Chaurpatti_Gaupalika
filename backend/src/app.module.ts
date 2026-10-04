import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { OfficialDataImportModule } from './data-import/official-data-import.module';
import { NoticesController } from './notices.controller';
import { NoticesService } from './notices.service';
import { AppealsModule } from './appeals.module';
import { PrismaModule } from './prisma.module';

@Module({
  imports: [PrismaModule, OfficialDataImportModule, AppealsModule],
  controllers: [HealthController, NoticesController],
  providers: [NoticesService],
})
export class AppModule {}
