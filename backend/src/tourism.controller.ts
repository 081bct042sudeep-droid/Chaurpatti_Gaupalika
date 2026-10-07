import { BadRequestException, Body, Controller, Delete, Get, Headers, Param, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { AdminApiKeyGuard, AppealsRateLimitGuard, AppealsSecurityService } from './appeals-security';
import { TourismService } from './tourism.service';
import { uploadDirectory } from './upload-storage';

type UploadedImage = { buffer: Buffer; mimetype: string; size: number };

@Controller('v1/tourism')
@UseGuards(AppealsRateLimitGuard)
export class TourismController {
  constructor(private readonly tourism: TourismService, private readonly security: AppealsSecurityService) {}

  @Get('categories') categories() { return this.tourism.categories(); }
  @Get('places') places(@Query() query: { q?: string; ward?: string; category?: string; sort?: string; page?: string; limit?: string }) { return this.tourism.publicPlaces(query); }
  @Get('places/:id/favorite') favoriteStatus(@Param('id') id: string, @Headers('x-visitor-token') token?: string) { return this.tourism.favoriteStatus(id, this.security.visitorHash(token)); }
  @Post('places/:id/favorite') toggleFavorite(@Param('id') id: string, @Headers('x-visitor-token') token?: string) { return this.tourism.toggleFavorite(id, this.security.visitorHash(token)); }
  @Post('places/:id/view') recordView(@Param('id') id: string, @Headers('x-visitor-token') token?: string) { return this.tourism.recordView(id, this.security.visitorHash(token)); }
  @Post('places/:id/rating') rate(@Param('id') id: string, @Body('rating') rating: number, @Headers('x-visitor-token') token?: string) { return this.tourism.rate(id, Number(rating), this.security.visitorHash(token)); }
  @Post('places/:id/reviews') review(@Param('id') id: string, @Body('content') content: string, @Headers('x-visitor-token') token?: string) { return this.tourism.submitReview(id, content, this.security.visitorHash(token)); }
  @Post('reviews/:reviewId/report') reportReview(@Param('reviewId') reviewId: string, @Body() body: { reason: string; details?: string }, @Headers('x-visitor-token') token?: string) { return this.tourism.reportReview(reviewId, this.security.visitorHash(token), body.reason, body.details); }
  @Get('places/:slug') detail(@Param('slug') slug: string) { return this.tourism.publicDetail(slug); }

  @Get('admin/dashboard') @UseGuards(AdminApiKeyGuard) dashboard() { return this.tourism.dashboard(); }
  @Get('admin/categories') @UseGuards(AdminApiKeyGuard) adminCategories() { return this.tourism.adminCategories(); }
  @Post('admin/categories') @UseGuards(AdminApiKeyGuard) createCategory(@Body() body: { nameNp: string; nameEn: string; slug?: string; icon?: string; isActive?: boolean }) { return this.tourism.saveCategory(body); }
  @Patch('admin/categories/:id') @UseGuards(AdminApiKeyGuard) updateCategory(@Param('id') id: string, @Body() body: { nameNp: string; nameEn: string; slug?: string; icon?: string; isActive?: boolean }) { return this.tourism.saveCategory({ ...body, id }); }
  @Get('admin/places') @UseGuards(AdminApiKeyGuard) adminPlaces(@Query('status') status?: string) { return this.tourism.adminPlaces(status); }
  @Post('admin/places') @UseGuards(AdminApiKeyGuard) createPlace(@Body() body: Record<string, unknown>) { return this.tourism.savePlace(body); }
  @Patch('admin/places/:id') @UseGuards(AdminApiKeyGuard) updatePlace(@Param('id') id: string, @Body() body: Record<string, unknown>) { return this.tourism.savePlace(body, id); }
  @Patch('admin/places/:id/status') @UseGuards(AdminApiKeyGuard) setStatus(@Param('id') id: string, @Body('action') action: string) { return this.tourism.setStatus(id, action); }
  @Delete('admin/places/:id') @UseGuards(AdminApiKeyGuard) archivePlace(@Param('id') id: string) { return this.tourism.setStatus(id, 'archive'); }
  @Post('admin/places/:id/images') @UseGuards(AdminApiKeyGuard) addImage(@Param('id') id: string, @Body() body: { url: string; captionNp?: string; captionEn?: string; altText?: string; isFeatured?: boolean }) { return this.tourism.addImage(id, body); }
  @Delete('admin/places/:id/images/:imageId') @UseGuards(AdminApiKeyGuard) removeImage(@Param('id') id: string, @Param('imageId') imageId: string) { return this.tourism.removeImage(id, imageId); }
  @Get('admin/reviews') @UseGuards(AdminApiKeyGuard) adminReviews(@Query('status') status?: string) { return this.tourism.adminReviews(status); }
  @Patch('admin/reviews/:id') @UseGuards(AdminApiKeyGuard) moderateReview(@Param('id') id: string, @Body('status') status: string) { return this.tourism.moderateReview(id, status); }
  @Get('admin/review-reports') @UseGuards(AdminApiKeyGuard) adminReviewReports(@Query('status') status?: string) { return this.tourism.adminReviewReports(status); }
  @Patch('admin/review-reports/:id') @UseGuards(AdminApiKeyGuard) moderateReviewReport(@Param('id') id: string, @Body('status') status: string) { return this.tourism.moderateReviewReport(id, status); }
  @Post('admin/upload') @UseGuards(AdminApiKeyGuard) @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  async upload(@UploadedFile() file: UploadedImage | undefined) {
    const jpeg = file?.buffer[0] === 0xff && file.buffer[1] === 0xd8 && file.buffer[2] === 0xff;
    const png = file?.buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    const webp = file?.buffer.toString('ascii', 0, 4) === 'RIFF' && file.buffer.toString('ascii', 8, 12) === 'WEBP';
    if (!file || !['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype) || file.size > 5 * 1024 * 1024 || !(jpeg || png || webp)) throw new BadRequestException('Choose a valid JPG, PNG, or WEBP image up to 5 MB');
    const ext = file.mimetype === 'image/jpeg' ? 'jpg' : file.mimetype.split('/')[1];
    const dir = uploadDirectory('tourism'); await mkdir(dir, { recursive: true });
    const filename = `${randomUUID()}.${ext}`; await writeFile(join(dir, filename), file.buffer, { flag: 'wx' });
    return { url: `/api/uploads/tourism/${filename}` };
  }
}
