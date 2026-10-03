import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, Query } from '@nestjs/common';
import { AppealStatus, AppealType } from '@prisma/client';
import { AppealsService } from './appeals.service';

@Controller()
export class AppealsController {
  constructor(private readonly appeals: AppealsService) {}

  @Get('v1/public-appeals/categories') categories() { return this.appeals.categories(); }
  @Get('v1/public-appeals') list(@Query() query: { page?: number; limit?: number; wardId?: string; categoryId?: string; status?: AppealStatus; type?: AppealType; sort?: string }) { return this.appeals.listPublic(query); }
  @Get('v1/public-appeals/:id') detail(@Param('id') id: string) { return this.appeals.findPublic(id); }
  @Post('v1/public-appeals') create(@Body() body: Parameters<AppealsService['create']>[0]) { return this.appeals.create(body); }
  @Post('v1/public-appeals/:id/vote') vote(@Param('id') id: string, @Headers('x-visitor-id') visitorId: string) { return this.appeals.toggleVote(id, visitorId); }
  @Delete('v1/public-appeals/:id/vote') voteAgain(@Param('id') id: string, @Headers('x-visitor-id') visitorId: string) { return this.appeals.toggleVote(id, visitorId); }
  @Get('v1/public-appeals/:id/comments') comments(@Param('id') id: string) { return this.appeals.findPublic(id).then((appeal) => appeal.comments); }
  @Post('v1/public-appeals/:id/comments') comment(@Param('id') id: string, @Body('content') content: string, @Headers('x-visitor-id') visitorId?: string) { return this.appeals.comment(id, content, visitorId); }
  @Post('v1/public-appeals/:id/report') report(@Param('id') id: string, @Body() body: { reason: string; description?: string }, @Headers('x-visitor-id') visitorId?: string) { return this.appeals.report(id, body.reason, body.description, visitorId); }

  @Get('v1/admin/public-appeals') adminList(@Query('status') status?: AppealStatus) { return this.appeals.adminList(status); }
  @Patch('v1/admin/public-appeals/:id/status') status(@Param('id') id: string, @Body() body: { status: AppealStatus; note?: string }) { return this.appeals.changeStatus(id, body.status, body.note); }
  @Post('v1/admin/public-appeals/:id/response') response(@Param('id') id: string, @Body('response') response: string) { return this.appeals.response(id, response); }
  @Post('v1/admin/public-appeals/:id/resolve') resolve(@Param('id') id: string, @Body('note') note: string) { return this.appeals.resolve(id, note); }
}
