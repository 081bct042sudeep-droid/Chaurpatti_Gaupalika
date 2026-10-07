import { BadRequestException, Controller, Get, Post, Query, UploadedFile, UseGuards, UseInterceptors, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminApiKeyGuard } from './appeals-security';
import { BudgetService } from './budget.service';

@Controller('budget')
export class BudgetController {
  constructor(private readonly budgets: BudgetService) {}

  @Get('years') years() { return this.budgets.publicYears(); }
  @Get() overview(@Query('fiscalYear') fiscalYear?: string) { return this.budgets.publicBudget(fiscalYear); }
}

@Controller('admin/budget')
@UseGuards(AdminApiKeyGuard)
export class AdminBudgetController {
  constructor(private readonly budgets: BudgetService) {}

  @Get() status() { return this.budgets.adminStatus(); }
  @Post('scan') scan() { return this.budgets.scanOfficialSource(); }
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 35 * 1024 * 1024 } }))
  upload(@UploadedFile() file: { buffer: Buffer; originalname: string } | undefined, @Body('title') title = '', @Body('sourceUrl') sourceUrl = '', @Body('fiscalYear') fiscalYear = '') {
    if (!file?.buffer) throw new BadRequestException('Choose an official budget PDF to upload.');
    return this.budgets.importUploadedPdf(file.buffer, title || file.originalname, sourceUrl, fiscalYear);
  }
}
