import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../node_modules/.prisma/portal-postgres-client';
import { PrismaService } from './prisma.service';

const seededCategories = [
  ['प्राकृतिक स्थल', 'Nature', 'tourism-nature', '🌿'],
  ['धार्मिक तथा सम्पदा स्थल', 'Heritage and religious sites', 'tourism-heritage', '🏛️'],
  ['सांस्कृतिक स्थल', 'Culture', 'tourism-culture', '🎭'],
  ['ताल तथा जलाशय', 'Lakes and water', 'tourism-water', '💧'],
  ['दृश्यावलोकन तथा पदयात्रा', 'Views and hiking', 'tourism-hiking', '🥾'],
  ['अन्य', 'Other', 'tourism-other', '📍'],
] as const;
const localizedFields = [
  'descriptionNp', 'descriptionEn', 'shortDescriptionNp', 'shortDescriptionEn', 'historyNp', 'historyEn',
  'culturalSignificanceNp', 'culturalSignificanceEn', 'religiousSignificanceNp', 'religiousSignificanceEn',
  'naturalFeaturesNp', 'naturalFeaturesEn', 'activitiesNp', 'activitiesEn', 'bestTimeNp', 'bestTimeEn',
  'howToReachNp', 'howToReachEn', 'facilitiesNp', 'facilitiesEn', 'safetyInfoNp', 'safetyInfoEn',
  'emergencyInfoNp', 'emergencyInfoEn',
] as const;

@Injectable()
export class TourismService {
  constructor(private readonly prisma: PrismaService) {}

  async categories() {
    await this.ensureCategories();
    return this.prisma.mapCategory.findMany({ where: { isTourism: true, isActive: true }, orderBy: { nameNp: 'asc' } });
  }

  adminCategories() { return this.prisma.mapCategory.findMany({ where: { isTourism: true }, orderBy: { nameNp: 'asc' } }); }

  async saveCategory(input: { id?: string; nameNp: string; nameEn: string; slug?: string; icon?: string; isActive?: boolean }) {
    const nameNp = String(input.nameNp ?? '').trim();
    const nameEn = String(input.nameEn ?? '').trim();
    const slug = String(input.slug || nameEn || nameNp).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
    if (!nameNp || !nameEn || !slug) throw new BadRequestException('Add category names in Nepali and English.');
    const data = { nameNp: nameNp.slice(0, 100), nameEn: nameEn.slice(0, 100), slug: slug.startsWith('tourism-') ? slug : `tourism-${slug}`, icon: this.clean(input.icon, 12), isActive: input.isActive ?? true, isTourism: true };
    const category = input.id
      ? await this.prisma.mapCategory.update({ where: { id: input.id }, data })
      : await this.prisma.mapCategory.create({ data });
    await this.audit(input.id ? 'TOURISM_CATEGORY_UPDATE' : 'TOURISM_CATEGORY_CREATE', 'MapCategory', category.id, { slug: category.slug, nameNp: category.nameNp, nameEn: category.nameEn, isActive: category.isActive });
    return category;
  }

  async publicPlaces(query: { q?: string; ward?: string; category?: string; sort?: string; page?: string; limit?: string }) {
    await this.ensureCategories();
    const page = Math.max(1, Math.floor(Number(query.page) || 1));
    const limit = Math.min(48, Math.max(1, Math.floor(Number(query.limit) || 12)));
    const where: Prisma.MapPlaceWhereInput = { isTourism: true, tourismStatus: 'PUBLISHED', isPublished: true, isVerified: true, category: { isActive: true, isTourism: true } };
    const search = query.q?.trim().replace(/\s+/g, ' ').slice(0, 100);
    if (search) where.OR = [
      { nameNp: { contains: search } }, { nameEn: { contains: search } }, { shortDescriptionNp: { contains: search } },
      { shortDescriptionEn: { contains: search } }, { descriptionNp: { contains: search } }, { descriptionEn: { contains: search } },
      { historyNp: { contains: search } }, { historyEn: { contains: search } }, { culturalSignificanceNp: { contains: search } },
      { culturalSignificanceEn: { contains: search } }, { religiousSignificanceNp: { contains: search } }, { religiousSignificanceEn: { contains: search } },
      { naturalFeaturesNp: { contains: search } }, { naturalFeaturesEn: { contains: search } }, { activitiesNp: { contains: search } },
      { activitiesEn: { contains: search } }, { bestTimeNp: { contains: search } }, { bestTimeEn: { contains: search } },
      { howToReachNp: { contains: search } }, { howToReachEn: { contains: search } }, { address: { contains: search } },
      { category: { nameNp: { contains: search } } }, { category: { nameEn: { contains: search } } },
    ];
    if (query.ward && /^[1-7]$/.test(query.ward)) where.wardNumber = Number(query.ward);
    if (query.category && /^[a-z0-9-]{2,80}$/.test(query.category)) where.category = { isTourism: true, isActive: true, slug: query.category.startsWith('tourism-') ? query.category : `tourism-${query.category}` };
    const orderBy: Prisma.MapPlaceOrderByWithRelationInput | Prisma.MapPlaceOrderByWithRelationInput[] = query.sort === 'popular' ? [{ viewCount: 'desc' }, { ratingCount: 'desc' }, { nameNp: 'asc' }]
      : query.sort === 'rating' ? [{ averageRating: 'desc' }, { ratingCount: 'desc' }, { nameNp: 'asc' }]
      : query.sort === 'views' ? [{ viewCount: 'desc' }, { nameNp: 'asc' }]
      : query.sort === 'name-en' ? [{ nameEn: 'asc' }, { nameNp: 'asc' }]
      : query.sort === 'name-np' ? { nameNp: 'asc' }
      : { createdAt: 'desc' };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.mapPlace.findMany({ where, include: { category: true, tourismImages: { orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }] } }, orderBy, skip: (page - 1) * limit, take: limit }),
      this.prisma.mapPlace.count({ where }),
    ]);
    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async publicDetail(slug: string) {
    const place = await this.prisma.mapPlace.findFirst({
      where: { slug, isTourism: true, tourismStatus: 'PUBLISHED', isPublished: true, isVerified: true, category: { isActive: true, isTourism: true } },
      include: {
        category: true,
        tourismImages: { orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }] },
        tourismReviews: { where: { status: 'APPROVED' }, select: { id: true, content: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 30 },
      },
    });
    if (!place) throw new NotFoundException('Tourism place not found');
    return place;
  }

  async recordView(id: string, visitorHash: string) {
    await this.findPublicById(id);
    const dayBucket = new Date().toISOString().slice(0, 10);
    try {
      await this.prisma.$transaction([
        this.prisma.tourismVisit.create({ data: { placeId: id, visitorHash, dayBucket } }),
        this.prisma.mapPlace.update({ where: { id }, data: { viewCount: { increment: 1 } } }),
      ]);
    } catch (error) {
      if ((error as { code?: string }).code !== 'P2002') throw error;
    }
    const place = await this.prisma.mapPlace.findUniqueOrThrow({ where: { id }, select: { viewCount: true } });
    return { viewCount: place.viewCount };
  }

  async rate(id: string, rating: number, visitorHash: string) {
    await this.findPublicById(id);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new BadRequestException('Rating must be from 1 to 5.');
    await this.prisma.tourismRating.upsert({ where: { placeId_visitorHash: { placeId: id, visitorHash } }, create: { placeId: id, visitorHash, rating }, update: { rating } });
    const aggregate = await this.prisma.tourismRating.aggregate({ where: { placeId: id }, _avg: { rating: true }, _count: { _all: true } });
    await this.prisma.mapPlace.update({ where: { id }, data: { averageRating: aggregate._avg.rating ?? 0, ratingCount: aggregate._count._all } });
    return { averageRating: aggregate._avg.rating ?? 0, ratingCount: aggregate._count._all, yourRating: rating };
  }

  async submitReview(id: string, content: string, visitorHash: string) {
    await this.findPublicById(id);
    const text = String(content ?? '').trim();
    if (text.length < 10 || text.length > 2000) throw new BadRequestException('A review must contain 10–2,000 characters.');
    const review = await this.prisma.tourismReview.upsert({
      where: { placeId_visitorHash: { placeId: id, visitorHash } },
      create: { placeId: id, visitorHash, content: text, status: 'PENDING' },
      update: { content: text, status: 'PENDING' },
      select: { id: true, status: true, createdAt: true },
    });
    return { ...review, message: 'Your review was submitted for moderation.' };
  }

  async reportReview(reviewId: string, visitorHash: string, reason: string, details?: string) {
    if (!['SPAM', 'ABUSIVE_CONTENT', 'FALSE_INFORMATION', 'PERSONAL_INFORMATION', 'OTHER'].includes(reason)) throw new BadRequestException('Choose a valid review report reason.');
    const review = await this.prisma.tourismReview.findFirst({ where: { id: reviewId, status: 'APPROVED', place: { isTourism: true, isPublished: true, isVerified: true, tourismStatus: 'PUBLISHED' } }, select: { id: true } });
    if (!review) throw new NotFoundException('Review not found');
    const report = await this.prisma.tourismReviewReport.upsert({
      where: { reviewId_visitorHash: { reviewId, visitorHash } },
      create: { reviewId, visitorHash, reason, details: this.clean(details, 1000) },
      update: { reason, details: this.clean(details, 1000), status: 'PENDING' },
      select: { id: true, status: true, createdAt: true },
    });
    return { ...report, message: 'Your report was submitted for review.' };
  }

  async favoriteStatus(id: string, visitorHash: string) {
    await this.findPublicById(id);
    const favorite = await this.prisma.tourismFavorite.findUnique({ where: { placeId_visitorHash: { placeId: id, visitorHash } }, select: { id: true } });
    return { saved: Boolean(favorite) };
  }

  async toggleFavorite(id: string, visitorHash: string) {
    await this.findPublicById(id);
    const key = { placeId_visitorHash: { placeId: id, visitorHash } };
    const existing = await this.prisma.tourismFavorite.findUnique({ where: key });
    if (existing) {
      await this.prisma.tourismFavorite.delete({ where: key });
      return { saved: false };
    }
    try { await this.prisma.tourismFavorite.create({ data: { placeId: id, visitorHash } }); }
    catch (error) { if ((error as { code?: string }).code !== 'P2002') throw error; }
    return { saved: true };
  }

  async dashboard() {
    const [total, drafts, awaitingVerification, published, archived, reviewsPending, views, places] = await Promise.all([
      this.prisma.mapPlace.count({ where: { isTourism: true } }),
      this.prisma.mapPlace.count({ where: { isTourism: true, tourismStatus: 'DRAFT' } }),
      this.prisma.mapPlace.count({ where: { isTourism: true, tourismStatus: 'VERIFIED', isPublished: false } }),
      this.prisma.mapPlace.count({ where: { isTourism: true, tourismStatus: 'PUBLISHED', isPublished: true, isVerified: true } }),
      this.prisma.mapPlace.count({ where: { isTourism: true, tourismStatus: 'ARCHIVED' } }),
      this.prisma.tourismReview.count({ where: { status: 'PENDING' } }),
      this.prisma.mapPlace.aggregate({ where: { isTourism: true }, _sum: { viewCount: true } }),
      this.prisma.mapPlace.findMany({ where: { isTourism: true }, select: { id: true, nameNp: true, nameEn: true, viewCount: true, averageRating: true, ratingCount: true, tourismStatus: true }, orderBy: { viewCount: 'desc' }, take: 8 }),
    ]);
    return { total, drafts, awaitingVerification, published, archived, reviewsPending, views: views._sum.viewCount ?? 0, places };
  }

  adminPlaces(status?: string) {
    const allowed = ['DRAFT', 'VERIFIED', 'PUBLISHED', 'ARCHIVED'];
    return this.prisma.mapPlace.findMany({ where: { isTourism: true, ...(status && allowed.includes(status) ? { tourismStatus: status } : {}) }, include: { category: true, tourismImages: { orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }] }, _count: { select: { tourismReviews: true, tourismFavorites: true } } }, orderBy: { updatedAt: 'desc' } });
  }

  async savePlace(input: Record<string, unknown>, id?: string) {
    const old = id ? await this.prisma.mapPlace.findUnique({ where: { id } }) : null;
    if (id && !old) throw new NotFoundException('Tourism place not found');
    const nameNp = String(input.nameNp ?? '').trim();
    const nameEn = this.clean(input.nameEn, 160);
    if (!nameNp || nameNp.length > 160) throw new BadRequestException('Add a Nepali place name (maximum 160 characters).');
    const categoryId = String(input.categoryId ?? old?.categoryId ?? '').trim();
    if (categoryId) {
      const category = await this.prisma.mapCategory.findFirst({ where: { id: categoryId, isTourism: true, isActive: true } });
      if (!category) throw new BadRequestException('Choose an active tourism category.');
    }
    const ward = input.wardNumber == null || input.wardNumber === '' ? null : Number(input.wardNumber);
    if (ward !== null && (!Number.isInteger(ward) || ward < 1 || ward > 7)) throw new BadRequestException('Ward must be between 1 and 7.');
    const lat = input.latitude == null || input.latitude === '' ? null : Number(input.latitude);
    const lon = input.longitude == null || input.longitude === '' ? null : Number(input.longitude);
    if ((lat === null) !== (lon === null) || (lat !== null && (!Number.isFinite(lat) || Math.abs(lat) > 90 || !Number.isFinite(lon) || Math.abs(lon!) > 180))) throw new BadRequestException('Provide a valid latitude and longitude together.');
    const sourceName = this.clean(input.sourceName, 200) ?? old?.sourceName ?? null;
    const sourceUrl = this.clean(input.sourceUrl, 500) ?? old?.sourceUrl ?? null;
    if (sourceUrl && !this.isHttpUrl(sourceUrl)) throw new BadRequestException('Source URL must start with http:// or https://.');
    const baseSlug = String(input.slug ?? old?.slug ?? nameEn ?? nameNp).toLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N}-]+/gu, '-').replace(/^-|-$/g, '').slice(0, 150);
    if (!baseSlug) throw new BadRequestException('Add a valid place slug.');
    let slug = baseSlug;
    if (!old || old.slug !== slug) {
      const duplicate = await this.prisma.mapPlace.findUnique({ where: { slug } });
      if (duplicate && duplicate.id !== id) slug = `${baseSlug.slice(0, 138)}-${Math.random().toString(36).slice(2, 8)}`;
    }
    const data: Record<string, unknown> = {
      nameNp, nameEn, slug, categoryId: categoryId || null, wardNumber: ward, latitude: lat, longitude: lon,
      isTourism: true, address: this.clean(input.address, 400), website: this.clean(input.website, 300), phone: this.clean(input.phone, 80), email: this.clean(input.email, 180), openingHours: this.clean(input.openingHours, 500),
      sourceName, sourceUrl,
    };
    for (const field of localizedFields) data[field] = this.clean(input[field], field.startsWith('shortDescription') ? 500 : 10000);
    data.descriptionNp = data.descriptionNp ?? null;
    data.descriptionEn = data.descriptionEn ?? null;
    if (input.imageUrl !== undefined) data.imageUrl = this.clean(input.imageUrl, 500);
    if (data.imageUrl && !this.validImageUrl(data.imageUrl as string)) throw new BadRequestException('Use an uploaded tourism photo or an http/https image URL.');
    const place = old
      ? await this.prisma.mapPlace.update({ where: { id: old.id }, data: data as Prisma.MapPlaceUpdateInput, include: { category: true } })
      : await this.prisma.mapPlace.create({ data: { ...data, isPublished: false, isVerified: false, tourismStatus: 'DRAFT' } as Prisma.MapPlaceUncheckedCreateInput, include: { category: true } });
    await this.audit(old ? 'TOURISM_PLACE_UPDATE' : 'TOURISM_PLACE_CREATE', 'MapPlace', place.id, { slug: place.slug, nameNp: place.nameNp, tourismStatus: place.tourismStatus, categoryId: place.categoryId, wardNumber: place.wardNumber });
    return place;
  }

  async setStatus(id: string, action: string) {
    const place = await this.prisma.mapPlace.findFirst({ where: { id, isTourism: true } });
    if (!place) throw new NotFoundException('Tourism place not found');
    let data: Prisma.MapPlaceUpdateInput;
    let auditAction: string;
    if (action === 'verify') {
      if (!place.sourceName || !place.sourceUrl || !this.isHttpUrl(place.sourceUrl)) throw new BadRequestException('Add a valid source name and URL before verification.');
      data = { isVerified: true, isPublished: false, tourismStatus: 'VERIFIED', verifiedAt: new Date() }; auditAction = 'TOURISM_PLACE_VERIFY';
    } else if (action === 'publish') {
      if (!place.isVerified || !place.verifiedAt || !place.sourceName || !place.sourceUrl) throw new BadRequestException('Verify the source and its details before publishing.');
      data = { isPublished: true, tourismStatus: 'PUBLISHED' }; auditAction = 'TOURISM_PLACE_PUBLISH';
    } else if (action === 'unpublish') {
      data = { isPublished: false, tourismStatus: place.isVerified ? 'VERIFIED' : 'DRAFT' }; auditAction = 'TOURISM_PLACE_UNPUBLISH';
    } else if (action === 'archive') {
      data = { isPublished: false, tourismStatus: 'ARCHIVED' }; auditAction = 'TOURISM_PLACE_ARCHIVE';
    } else if (action === 'draft') {
      data = { isPublished: false, isVerified: false, verifiedAt: null, tourismStatus: 'DRAFT' }; auditAction = 'TOURISM_PLACE_DRAFT';
    } else throw new BadRequestException('Choose verify, publish, unpublish, archive, or draft.');
    const updated = await this.prisma.mapPlace.update({ where: { id }, data, include: { category: true } });
    await this.audit(auditAction, 'MapPlace', id, { tourismStatus: updated.tourismStatus, isVerified: updated.isVerified, isPublished: updated.isPublished });
    return updated;
  }

  async addImage(placeId: string, input: { url: string; captionNp?: string; captionEn?: string; altText?: string; isFeatured?: boolean }) {
    const place = await this.prisma.mapPlace.findFirst({ where: { id: placeId, isTourism: true } });
    if (!place) throw new NotFoundException('Tourism place not found');
    const url = String(input.url ?? '').trim();
    if (!this.validImageUrl(url)) throw new BadRequestException('Upload a valid JPG, PNG, or WEBP image first.');
    const count = await this.prisma.tourismImage.count({ where: { placeId } });
    if (count >= 5) throw new BadRequestException('A place can have at most 5 gallery images.');
    const featured = Boolean(input.isFeatured) || count === 0;
    const image = await this.prisma.$transaction(async (tx) => {
      if (featured) await tx.tourismImage.updateMany({ where: { placeId }, data: { isFeatured: false } });
      const created = await tx.tourismImage.create({ data: { placeId, url, captionNp: this.clean(input.captionNp, 300), captionEn: this.clean(input.captionEn, 300), altText: this.clean(input.altText, 300), sortOrder: count, isFeatured: featured } });
      if (featured) await tx.mapPlace.update({ where: { id: placeId }, data: { imageUrl: url } });
      return created;
    });
    await this.audit('TOURISM_IMAGE_ADD', 'TourismImage', image.id, { placeId, url, isFeatured: image.isFeatured });
    return image;
  }

  async removeImage(placeId: string, imageId: string) {
    const image = await this.prisma.tourismImage.findFirst({ where: { id: imageId, placeId }, include: { place: { select: { imageUrl: true } } } });
    if (!image) throw new NotFoundException('Tourism image not found');
    await this.prisma.$transaction(async (tx) => {
      await tx.tourismImage.delete({ where: { id: imageId } });
      if (image.place.imageUrl === image.url) {
        const replacement = await tx.tourismImage.findFirst({ where: { placeId }, orderBy: [{ sortOrder: 'asc' }] });
        if (replacement) await tx.tourismImage.update({ where: { id: replacement.id }, data: { isFeatured: true } });
        await tx.mapPlace.update({ where: { id: placeId }, data: { imageUrl: replacement?.url ?? null } });
      }
    });
    await this.audit('TOURISM_IMAGE_REMOVE', 'TourismImage', imageId, { placeId, url: image.url });
    return { removed: true };
  }

  adminReviews(status?: string) {
    const where = status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status) ? { status } : {};
    return this.prisma.tourismReview.findMany({ where, include: { place: { select: { id: true, slug: true, nameNp: true, nameEn: true } } }, orderBy: { createdAt: 'desc' }, take: 200 });
  }

  async moderateReview(id: string, status: string) {
    if (!['APPROVED', 'REJECTED'].includes(status)) throw new BadRequestException('Review status must be APPROVED or REJECTED.');
    const review = await this.prisma.tourismReview.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');
    const updated = await this.prisma.tourismReview.update({ where: { id }, data: { status } });
    await this.audit(status === 'APPROVED' ? 'TOURISM_REVIEW_APPROVE' : 'TOURISM_REVIEW_REJECT', 'TourismReview', id, { placeId: review.placeId, status });
    return { id: updated.id, status: updated.status };
  }

  adminReviewReports(status?: string) {
    return this.prisma.tourismReviewReport.findMany({
      where: status && ['PENDING', 'REVIEWED', 'DISMISSED'].includes(status) ? { status } : {},
      include: { review: { select: { id: true, content: true, status: true, place: { select: { id: true, slug: true, nameNp: true, nameEn: true } } } } },
      orderBy: { createdAt: 'desc' }, take: 200,
    });
  }

  async moderateReviewReport(id: string, status: string) {
    if (!['REVIEWED', 'DISMISSED'].includes(status)) throw new BadRequestException('Report status must be REVIEWED or DISMISSED.');
    const report = await this.prisma.tourismReviewReport.findUnique({ where: { id } });
    if (!report) throw new NotFoundException('Review report not found');
    const updated = await this.prisma.tourismReviewReport.update({ where: { id }, data: { status } });
    await this.audit(status === 'REVIEWED' ? 'TOURISM_REVIEW_REPORT_REVIEW' : 'TOURISM_REVIEW_REPORT_DISMISS', 'TourismReviewReport', id, { reviewId: report.reviewId, status });
    return { id: updated.id, status: updated.status };
  }

  private async findPublicById(id: string) {
    const place = await this.prisma.mapPlace.findFirst({ where: { id, isTourism: true, tourismStatus: 'PUBLISHED', isPublished: true, isVerified: true, category: { isTourism: true, isActive: true } } });
    if (!place) throw new NotFoundException('Tourism place not found');
    return place;
  }

  private async ensureCategories() {
    if (await this.prisma.mapCategory.count({ where: { isTourism: true } })) return;
    await this.prisma.mapCategory.createMany({ data: seededCategories.map(([nameNp, nameEn, slug, icon]) => ({ nameNp, nameEn, slug, icon, isTourism: true })) });
  }

  private async audit(action: string, entity: string, entityId: string, value: Record<string, unknown>) {
    await this.prisma.auditLog.create({ data: { action, entity, entityId, userName: 'admin', newValue: value as Prisma.InputJsonObject } });
  }

  private clean(value: unknown, max: number): string | null {
    if (typeof value !== 'string') return null;
    const text = value.trim().slice(0, max);
    return text || null;
  }

  private isHttpUrl(value: string) { try { const url = new URL(value); return url.protocol === 'http:' || url.protocol === 'https:'; } catch { return false; } }
  private validImageUrl(value: string) { return /^\/api\/uploads\/tourism\/[a-f0-9-]{36}\.(jpg|png|webp)$/i.test(value) || this.isHttpUrl(value); }
}
