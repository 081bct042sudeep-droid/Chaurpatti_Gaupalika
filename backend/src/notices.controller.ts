import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { NoticesService, NoticeRecord } from './notices.service';
import { AdminApiKeyGuard } from './appeals-security';

@Controller('notices')
export class NoticesController {
  constructor(private readonly notices: NoticesService) {}

  @Get()
  list() { return this.notices.list(); }

  @Post('upload') @UseGuards(AdminApiKeyGuard) @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 15 * 1024 * 1024 } }))
  upload(@UploadedFile() file?: { buffer: Buffer; mimetype: string; originalname: string; size: number }) {
    if (!file) throw new BadRequestException('Choose a document to upload.');
    return this.notices.uploadAttachment(file);
  }

  @Post()
  @UseGuards(AdminApiKeyGuard)
  create(@Body() body: Omit<NoticeRecord, 'id' | 'updatedAt'>) { return this.notices.create(body); }

  @Patch(':id')
  @UseGuards(AdminApiKeyGuard)
  update(@Param('id') id: string, @Body() body: Partial<Omit<NoticeRecord, 'id' | 'updatedAt'>>) { return this.notices.update(id, body); }

  @Delete(':id')
  @UseGuards(AdminApiKeyGuard)
  remove(@Param('id') id: string) { return this.notices.remove(id); }
}
