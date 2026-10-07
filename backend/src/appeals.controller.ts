import { BadRequestException, Body, Controller, Delete, Get, Headers, Param, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppealStatus, AppealType, CommentStatus, ReportStatus } from './appeal-enums';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { AppealsService } from './appeals.service';
import { AdminApiKeyGuard, AppealsRateLimitGuard, AppealsSecurityService } from './appeals-security';
import { uploadDirectory } from './upload-storage';

type UploadedImage = { buffer: Buffer; mimetype: string; size: number };
@Controller('v1')
@UseGuards(AppealsRateLimitGuard)
export class AppealsController {
  constructor(private readonly appeals: AppealsService, private readonly security: AppealsSecurityService) {}

  @Get('public-appeals/visitor-token') visitorToken() { return { token: this.security.issueVisitorToken() }; }
  @Get('public-appeals/categories') categories() { return this.appeals.categories(); }
  @Get('public-appeals/mine') mine(@Headers('x-visitor-token') token?: string) { return this.appeals.listMine(this.security.visitorHash(token)); }
  @Get('public-appeals/similar') similar(@Query('title') title = '', @Query('description') description = '', @Query('wardId') wardId?: string) { return this.appeals.similar(`${title} ${description}`, description, wardId); }
  @Get('public-appeals') list(@Query() query: { page?: number; limit?: number; wardId?: string; categoryId?: string; status?: AppealStatus; type?: AppealType; sort?: string; search?: string }) { return this.appeals.listPublic(query); }
  @Get('public-appeals/:id') detail(@Param('id') id: string) { return this.appeals.findPublic(id); }
  @Get('public-appeals/:id/vote') voteStatus(@Param('id') id: string, @Headers('x-visitor-token') token?: string) { return this.appeals.voteStatus(id, this.security.visitorHash(token)); }
  @Post('public-appeals') create(@Body() body: Parameters<AppealsService['create']>[0], @Headers('x-visitor-token') token?: string) { return this.appeals.create(body, this.security.visitorHash(token)); }
  @Post('public-appeals/upload') @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  async upload(@UploadedFile() file: UploadedImage | undefined, @Headers('x-visitor-token') token?: string) {
    this.security.visitorHash(token);
    const isJpeg = file?.buffer[0] === 0xff && file.buffer[1] === 0xd8 && file.buffer[2] === 0xff;
    const isPng = file?.buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    const isWebp = file?.buffer.toString('ascii', 0, 4) === 'RIFF' && file.buffer.toString('ascii', 8, 12) === 'WEBP';
    if (!file || !['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype) || file.size > 5 * 1024 * 1024 || !(isJpeg || isPng || isWebp)) throw new BadRequestException('Choose a valid JPG, PNG, or WEBP image up to 5 MB');
    const ext = file.mimetype === 'image/jpeg' ? 'jpg' : file.mimetype.split('/')[1];
    const dir = uploadDirectory('appeals'); await mkdir(dir, { recursive: true });
    const filename = `${randomUUID()}.${ext}`; await writeFile(join(dir, filename), file.buffer, { flag: 'wx' });
    return { url: `/api/uploads/appeals/${filename}` };
  }
  @Post('public-appeals/:id/vote') vote(@Param('id') id: string, @Headers('x-visitor-token') token?: string) { return this.appeals.toggleVote(id, this.security.visitorHash(token)); }
  @Delete('public-appeals/:id/vote') voteAgain(@Param('id') id: string, @Headers('x-visitor-token') token?: string) { return this.appeals.toggleVote(id, this.security.visitorHash(token)); }
  @Get('public-appeals/:id/comments') comments(@Param('id') id: string) { return this.appeals.findPublic(id).then((appeal) => appeal.comments); }
  @Post('public-appeals/:id/comments') comment(@Param('id') id: string, @Body() body: { content: string; parentId?: string }, @Headers('x-visitor-token') token?: string) { return this.appeals.comment(id, body.content, this.security.visitorHash(token), body.parentId); }
  @Post('public-appeals/:id/report') report(@Param('id') id: string, @Body() body: { reason: string; description?: string; commentId?: string }, @Headers('x-visitor-token') token?: string) { return this.appeals.report(id, body.reason, body.description, this.security.visitorHash(token), body.commentId); }

  @Get('admin/public-appeals') @UseGuards(AdminApiKeyGuard) adminList(@Query('status') status?: AppealStatus) { return this.appeals.adminList(status); }
  @Get('admin/public-appeals/:id') @UseGuards(AdminApiKeyGuard) adminDetail(@Param('id') id: string) { return this.appeals.adminDetail(id); }
  @Delete('admin/public-appeals/:id') @UseGuards(AdminApiKeyGuard) deleteAppeal(@Param('id') id: string) { return this.appeals.deleteAppeal(id); }
  @Patch('admin/public-appeals/:id') @UseGuards(AdminApiKeyGuard) edit(@Param('id') id: string, @Body() body: { title?: string; description?: string; wardId?: string; categoryId?: string; type?: AppealType }) { return this.appeals.edit(id, body); }
  @Patch('admin/public-appeals/:id/status') @UseGuards(AdminApiKeyGuard) status(@Param('id') id: string, @Body() body: { status: AppealStatus; note?: string }) { return this.appeals.changeStatus(id, body.status, body.note); }
  @Post('admin/public-appeals/:id/response') @UseGuards(AdminApiKeyGuard) response(@Param('id') id: string, @Body('response') response: string) { return this.appeals.response(id, response); }
  @Post('admin/public-appeals/:id/resolve') @UseGuards(AdminApiKeyGuard) resolve(@Param('id') id: string, @Body() body: { note: string; mediaUrl?: string }) { return this.appeals.resolve(id, body.note, body.mediaUrl); }
  @Patch('admin/appeal-comments/:id/moderation') @UseGuards(AdminApiKeyGuard) moderateComment(@Param('id') id: string, @Body('status') status: CommentStatus) { return this.appeals.moderateComment(id, status); }
  @Get('admin/appeal-reports') @UseGuards(AdminApiKeyGuard) reports() { return this.appeals.adminReports(); }
  @Patch('admin/appeal-reports/:id') @UseGuards(AdminApiKeyGuard) moderateReport(@Param('id') id: string, @Body('status') status: ReportStatus) { return this.appeals.moderateReport(id, status); }
  @Get('admin/appeal-categories') @UseGuards(AdminApiKeyGuard) adminCategories() { return this.appeals.adminCategories(); }
  @Post('admin/appeal-categories') @UseGuards(AdminApiKeyGuard) createCategory(@Body() body: { nameNp: string; nameEn: string; slug?: string; icon?: string }) { return this.appeals.saveCategory(body); }
  @Patch('admin/appeal-categories/:id') @UseGuards(AdminApiKeyGuard) updateCategory(@Param('id') id: string, @Body() body: { nameNp: string; nameEn: string; slug?: string; icon?: string; isActive?: boolean }) { return this.appeals.saveCategory({ ...body, id }); }
  @Delete('admin/appeal-categories/:id') @UseGuards(AdminApiKeyGuard) deleteCategory(@Param('id') id: string) { return this.appeals.removeCategory(id); }
  @Get('admin/appeal-analytics') @UseGuards(AdminApiKeyGuard) analytics() { return this.appeals.analytics(); }
}
