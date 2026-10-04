import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { AdminApiKeyGuard, AppealsRateLimitGuard } from './appeals-security';
import { MapService } from './map.service';

@Controller('map')
@UseGuards(AppealsRateLimitGuard)
export class MapController {
  constructor(private readonly map: MapService) {}

  @Get('places') places(@Query('q') query?: string, @Query('category') category?: string, @Query('ward') ward?: string) {
    return this.map.publicPlaces(query, category, ward);
  }
  @Get('autocomplete') autocomplete(@Query('q') query?: string, @Query('lang') language?: string) { return this.map.autocomplete(query || '', language === 'ne' ? 'ne' : 'en'); }
  @Get('geocode') geocode(@Query('q') query?: string) { return this.map.geocode(query || ''); }
  @Get('categories') categories() { return this.map.categories(); }
  @Get('boundaries') boundaries(@Query('ward') ward?: string) { return this.map.boundaries(ward); }
  @Get('appeals') appeals() { return this.map.publicAppeals(); }

  @Get('admin/places') @UseGuards(AdminApiKeyGuard) adminPlaces() { return this.map.adminPlaces(); }
  @Get('admin/categories') @UseGuards(AdminApiKeyGuard) adminCategories() { return this.map.adminCategories(); }
  @Get('admin/boundaries') @UseGuards(AdminApiKeyGuard) adminBoundaries() { return this.map.adminBoundaries(); }
  @Post('admin/places') @UseGuards(AdminApiKeyGuard) createPlace(@Body() body: PlaceInput) { return this.map.savePlace(body); }
  @Patch('admin/places/:id') @UseGuards(AdminApiKeyGuard) updatePlace(@Param('id') id: string, @Body() body: PlaceInput) { return this.map.savePlace(body, id); }
  @Delete('admin/places/:id') @UseGuards(AdminApiKeyGuard) deletePlace(@Param('id') id: string) { return this.map.deletePlace(id); }
  @Post('admin/categories') @UseGuards(AdminApiKeyGuard) saveCategory(@Body() body: { id?: string; slug: string; nameNp: string; nameEn: string; icon?: string; isActive?: boolean }) { return this.map.saveCategory(body); }
  @Post('admin/upload') @UseGuards(AdminApiKeyGuard) @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  async upload(@UploadedFile() file: { buffer: Buffer; mimetype: string; size: number } | undefined) {
    const jpeg = file?.buffer[0] === 0xff && file.buffer[1] === 0xd8 && file.buffer[2] === 0xff;
    const png = file?.buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    const webp = file?.buffer.toString('ascii', 0, 4) === 'RIFF' && file.buffer.toString('ascii', 8, 12) === 'WEBP';
    if (!file || !['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype) || !(jpeg || png || webp)) throw new BadRequestException('Choose a valid JPG, PNG, or WEBP image up to 5 MB');
    const ext = file.mimetype === 'image/jpeg' ? 'jpg' : file.mimetype.split('/')[1];
    const dir = join(process.cwd(), 'uploads', 'map'); await mkdir(dir, { recursive: true });
    const filename = `${randomUUID()}.${ext}`; await writeFile(join(dir, filename), file.buffer, { flag: 'wx' });
    return { url: `/api/uploads/map/${filename}` };
  }
  @Post('admin/boundaries') @UseGuards(AdminApiKeyGuard) saveBoundary(@Body() body: { name: string; wardNumber?: number; geoJson: unknown; sourceName?: string; sourceUrl?: string; isPublished?: boolean }) { return this.map.saveBoundary(body); }
  @Get('directions') directions(@Query('from') from: string, @Query('to') to: string, @Query('mode') mode = 'driving') {
    const parse = (value: string) => value?.split(',').map(Number);
    const a = parse(from); const b = parse(to);
    if (!a || !b || a.length !== 2 || b.length !== 2 || [...a, ...b].some((v) => !Number.isFinite(v)) || [...a, ...b].some((v, i) => i % 2 === 0 ? Math.abs(v) > 90 : Math.abs(v) > 180)) throw new BadRequestException('Provide valid latitude,longitude pairs');
    if (mode !== 'driving') throw new BadRequestException('The configured route service supports driving directions only');
    return this.map.directions(a as [number, number], b as [number, number]);
  }
}

type PlaceInput = {
  slug?: string; nameNp: string; nameEn?: string; descriptionNp?: string; descriptionEn?: string;
  categoryId: string; wardNumber?: number; latitude?: number; longitude?: number;
  geometryType?: string; geometry?: unknown; address?: string; phone?: string; email?: string;
  website?: string; imageUrl?: string; openingHours?: string; isPublished?: boolean;
  isVerified?: boolean; sourceName?: string; sourceUrl?: string;
};
