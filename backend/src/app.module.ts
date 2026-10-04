import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { OfficialDataImportModule } from './data-import/official-data-import.module';
import { NoticesController } from './notices.controller';
import { NoticesService } from './notices.service';
import { AppealsModule } from './appeals.module';
import { PrismaModule } from './prisma.module';
import { MapController } from './map.controller';
import { MapService } from './map.service';

@Module({
  imports: [PrismaModule, OfficialDataImportModule, AppealsModule],
  controllers: [HealthController, NoticesController, MapController],
  providers: [NoticesService, MapService],
})
export class AppModule {}
