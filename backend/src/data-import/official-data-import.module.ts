import { Module } from '@nestjs/common';
import { OfficialDataImportController } from './official-data-import.controller';
import { OfficialDataImportService } from './official-data-import.service';
import { ChaurpatiSourceService } from './official/chaurpati/chaurpati-source.service';

@Module({
  controllers: [OfficialDataImportController],
  providers: [OfficialDataImportService, ChaurpatiSourceService],
  exports: [OfficialDataImportService],
})
export class OfficialDataImportModule {}
