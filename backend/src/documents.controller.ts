import { Body, Controller, Get, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminApiKeyGuard } from './appeals-security';
import { DocumentsService } from './documents.service';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documents: DocumentsService) {}

  @Get()
  listPublic() { return this.documents.listPublic(); }

  @Post('upload')
  @UseGuards(AdminApiKeyGuard)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 15 * 1024 * 1024 } }))
  upload(@UploadedFile() file?: { buffer: Buffer; mimetype: string; originalname: string; size: number }) {
    return this.documents.upload(file);
  }

  @Post()
  @UseGuards(AdminApiKeyGuard)
  publish(@Body() body: { title?: string; summary?: string; attachmentUrl?: string; sourceUrl?: string }) {
    return this.documents.publish(body);
  }
}
