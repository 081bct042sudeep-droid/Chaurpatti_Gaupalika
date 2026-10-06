import { BadRequestException, Body, Controller, Get, Injectable, Module, NotFoundException, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { AdminApiKeyGuard } from './appeals-security';

const verificationStatuses = ['VERIFIED', 'NEEDS_REVIEW', 'OUTDATED', 'ARCHIVED'] as const;
type OfficialServiceInput = {
  slug?: string; nameNp?: string; nameEn?: string; categoryNp?: string; categoryEn?: string;
  descriptionNp?: string; descriptionEn?: string; officialWebsiteUrl?: string; officialApplicationUrl?: string;
  officialFormUrl?: string; officialSourceUrl?: string; sourceName?: string; sourceDocumentName?: string;
  verificationStatus?: string; verifiedAt?: string | null; verifiedBy?: string; notes?: string;
  keywords?: string[]; displayOrder?: number; isPublished?: boolean;
};

@Injectable()
class OfficialServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublic(query = '') {
    const q = query.trim().replace(/\s+/g, ' ').slice(0, 100);
    const rows = await this.prisma.officialService.findMany({
      where: { isPublished: true, verificationStatus: { not: 'ARCHIVED' }, ...(q ? { OR: [
        { nameNp: { contains: q } }, { nameEn: { contains: q } }, { slug: { contains: q.toLowerCase() } },
        { categoryNp: { contains: q } }, { categoryEn: { contains: q } }, { keywordsJson: { contains: q } },
      ] } : {}) },
      orderBy: [{ displayOrder: 'asc' }, { nameNp: 'asc' }],
    });
    return rows.map((row) => this.publicRecord(row));
  }

  async publicDetail(slug: string) {
    const row = await this.prisma.officialService.findFirst({ where: { slug, isPublished: true, verificationStatus: { not: 'ARCHIVED' } } });
    if (!row) throw new NotFoundException('Official service information not found.');
    return this.publicRecord(row);
  }

  async adminList() {
    const rows = await this.prisma.officialService.findMany({ orderBy: [{ displayOrder: 'asc' }, { updatedAt: 'desc' }] });
    return rows.map((row) => ({ ...this.publicRecord(row), notes: row.notes, verifiedBy: row.verifiedBy }));
  }

  async save(input: OfficialServiceInput, id?: string) {
    const nameNp = this.text(input.nameNp, 180, true)!;
    const nameEn = this.text(input.nameEn, 180, true)!;
    const slugInput = this.text(input.slug, 100) || nameEn;
    const slug = slugInput.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 90);
    if (!slug) throw new BadRequestException('Enter a valid English slug.');
    const officialSourceUrl = this.url(input.officialSourceUrl, true)!;
    const verificationStatus = input.verificationStatus || 'NEEDS_REVIEW';
    if (!verificationStatuses.includes(verificationStatus as typeof verificationStatuses[number])) throw new BadRequestException('Choose a valid source verification status.');
    const displayOrder = Number(input.displayOrder ?? 0);
    if (!Number.isInteger(displayOrder) || displayOrder < 0 || displayOrder > 100000) throw new BadRequestException('Display order must be a non-negative whole number.');
    const data = {
      slug, nameNp, nameEn,
      categoryNp: this.text(input.categoryNp, 120), categoryEn: this.text(input.categoryEn, 120),
      descriptionNp: this.text(input.descriptionNp, 3000), descriptionEn: this.text(input.descriptionEn, 3000),
      officialWebsiteUrl: this.url(input.officialWebsiteUrl), officialApplicationUrl: this.url(input.officialApplicationUrl),
      officialFormUrl: this.url(input.officialFormUrl), officialSourceUrl,
      sourceName: this.text(input.sourceName, 180, true)!, sourceDocumentName: this.text(input.sourceDocumentName, 240),
      verificationStatus, verifiedAt: input.verifiedAt ? this.date(input.verifiedAt) : null,
      verifiedBy: this.text(input.verifiedBy, 160), notes: this.text(input.notes, 4000),
      keywordsJson: JSON.stringify(Array.isArray(input.keywords) ? input.keywords.map((word) => String(word).trim().slice(0, 80)).filter(Boolean).slice(0, 40) : []),
      displayOrder, isPublished: Boolean(input.isPublished),
    };
    const saved = id
      ? await this.prisma.officialService.update({ where: { id }, data })
      : await this.prisma.officialService.create({ data });
    return { ...this.publicRecord(saved), notes: saved.notes, verifiedBy: saved.verifiedBy };
  }

  private publicRecord(row: any) {
    let keywords: string[] = [];
    try { keywords = JSON.parse(row.keywordsJson); } catch { /* Ignore malformed legacy keywords. */ }
    const { notes: _notes, verifiedBy: _verifiedBy, keywordsJson: _keywordsJson, ...publicFields } = row;
    return { ...publicFields, keywords };
  }
  private text(value: unknown, max: number, required = false) {
    const clean = typeof value === 'string' ? value.trim().slice(0, max) : '';
    if (required && !clean) throw new BadRequestException('Complete all required source and title fields.');
    return clean || null;
  }
  private url(value: unknown, required = false) {
    const text = this.text(value, 1000, required);
    if (!text) return null;
    try { const url = new URL(text); if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error(); return url.toString(); }
    catch { throw new BadRequestException('Use a valid official HTTP or HTTPS URL.'); }
  }
  private date(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) throw new BadRequestException('Enter a valid last-verified date.');
    return date;
  }
}

@Controller('official-services')
export class OfficialServicesController {
  constructor(private readonly services: OfficialServicesService) {}
  @Get() listPublic(@Query('q') query = '') { return this.services.listPublic(query); }
  @Get(':slug') detail(@Param('slug') slug: string) { return this.services.publicDetail(slug); }
}

@Controller('admin/official-services')
@UseGuards(AdminApiKeyGuard)
export class AdminOfficialServicesController {
  constructor(private readonly services: OfficialServicesService) {}
  @Get() list() { return this.services.adminList(); }
  @Post() create(@Body() body: OfficialServiceInput) { return this.services.save(body); }
  @Patch(':id') update(@Param('id') id: string, @Body() body: OfficialServiceInput) { return this.services.save(body, id); }
}

@Module({ controllers: [OfficialServicesController, AdminOfficialServicesController], providers: [OfficialServicesService] })
export class OfficialServicesModule {}
