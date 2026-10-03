import { Controller, Get, Post } from '@nestjs/common';
import { OfficialDataImportService } from './official-data-import.service';

@Controller('admin/data-import')
export class OfficialDataImportController {
  constructor(private readonly imports: OfficialDataImportService) {}

  @Get('dashboard')
  getDashboard() {
    return this.imports.getDashboard();
  }

  @Get('latest')
  getLatest() {
    return this.imports.getLastBatch();
  }

  @Post('fetch')
  fetchLatest() {
    return this.imports.fetchLatest();
  }
}
