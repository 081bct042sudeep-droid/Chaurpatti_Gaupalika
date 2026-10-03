import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { NoticesService, NoticeRecord } from './notices.service';

@Controller('notices')
export class NoticesController {
  constructor(private readonly notices: NoticesService) {}

  @Get()
  list() { return this.notices.list(); }

  @Post()
  create(@Body() body: Omit<NoticeRecord, 'id' | 'updatedAt'>) { return this.notices.create(body); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: Partial<Omit<NoticeRecord, 'id' | 'updatedAt'>>) { return this.notices.update(id, body); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.notices.remove(id); }
}
