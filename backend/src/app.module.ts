import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { OfficialDataImportModule } from './data-import/official-data-import.module';
import { NoticesController } from './notices.controller';
import { NoticesService } from './notices.service';
import { AppealsModule } from './appeals.module';
import { PrismaModule } from './prisma.module';
import { MapController } from './map.controller';
import { MapService } from './map.service';
import { TourismModule } from './tourism.module';
import { OfficialServicesModule } from './official-services.module';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { BudgetModule } from './budget.module';

@Module({
  imports: [PrismaModule, OfficialDataImportModule, AppealsModule, TourismModule, OfficialServicesModule, BudgetModule],
  controllers: [HealthController, NoticesController, DocumentsController, MapController],
  providers: [NoticesService, DocumentsService, MapService],
})
export class AppModule {}
