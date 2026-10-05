import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AppealStatus, AppealType, CommentStatus, ReportStatus } from './appeal-enums';
import { Prisma } from '../node_modules/.prisma/portal-client';
import { randomBytes } from 'node:crypto';
import { PrismaService } from './prisma.service';

const publicStatuses = [AppealStatus.APPROVED, AppealStatus.UNDER_REVIEW, AppealStatus.FORWARDED, AppealStatus.IN_PROGRESS, AppealStatus.RESOLVED];
const defaultCategories = [
  ['खानेपानी', 'Water', 'water', '🚰'], ['सडक', 'Roads', 'roads', '🛣️'], ['शिक्षा', 'Education', 'education', '📚'],
  ['स्वास्थ्य', 'Health', 'health', '♥'], ['विद्युत', 'Electricity', 'electricity', '⚡'], ['कृषि', 'Agriculture', 'agriculture', '🌱'],
  ['पूर्वाधार', 'Infrastructure', 'infrastructure', '🏗️'], ['सरसफाइ', 'Sanitation', 'sanitation', '♻'], ['वातावरण', 'Environment', 'environment', '🌿'],
  ['यातायात', 'Transport', 'transport', '🚌'], ['सञ्चार/इन्टरनेट', 'Internet', 'internet', '📶'], ['सार्वजनिक सेवा', 'Public services', 'public-services', '🏛️'],
  ['पर्यटन', 'Tourism', 'tourism', '🏞️'], ['अन्य', 'Other', 'other', '○'],
];

@Injectable()
export class AppealsService {
  constructor(private readonly prisma: PrismaService) {}

  async categories() {
    if (!(await this.prisma.appealCategory.count())) {
      await this.prisma.appealCategory.createMany({ data: defaultCategories.map(([nameNp, nameEn, slug, icon]) => ({ nameNp, nameEn, slug, icon })) });
    }
    return this.prisma.appealCategory.findMany({ where: { isActive: true }, orderBy: { nameNp: 'asc' } });
  }
  adminCategories() { return this.prisma.appealCategory.findMany({ orderBy: { nameNp: 'asc' } }); }

  async listPublic(query: { page?: number; limit?: number; wardId?: string; categoryId?: string; status?: AppealStatus; type?: AppealType; sort?: string; search?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 20));
    const where: Prisma.PublicAppealWhereInput = { status: { in: publicStatuses } };
    if (query.wardId) where.wardId = query.wardId;
    if (query.categoryId) {
      const category = await this.prisma.appealCategory.findFirst({ where: { OR: [{ id: query.categoryId }, { slug: query.categoryId }] }, select: { id: true } });
      where.categoryId = category?.id ?? '__unknown_category__';
    }
    if (query.type && Object.values(AppealType).includes(query.type)) where.type = query.type;
    if (query.status && (publicStatuses as AppealStatus[]).includes(query.status)) where.status = query.status;
    if (query.search?.trim()) where.OR = [{ title: { contains: query.search.trim().slice(0, 100) } }, { description: { contains: query.search.trim().slice(0, 100) } }];
    const orderBy: Prisma.PublicAppealOrderByWithRelationInput | Prisma.PublicAppealOrderByWithRelationInput[] = query.sort === 'support' ? [{ supportCount: 'desc' }, { createdAt: 'desc' }] : query.sort === 'comments' ? [{ commentCount: 'desc' }, { createdAt: 'desc' }] : { createdAt: 'desc' };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.publicAppeal.findMany({ where, include: { category: true }, orderBy, skip: (page - 1) * limit, take: limit }),
      this.prisma.publicAppeal.count({ where }),
    ]);
    return { items: items.map((appeal) => this.publicAppeal(appeal)), total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findPublic(id: string) {
    const appeal = await this.prisma.publicAppeal.findFirst({ where: { id, status: { in: publicStatuses } }, include: { category: true, comments: { where: { status: CommentStatus.VISIBLE }, orderBy: { createdAt: 'asc' } }, responses: { orderBy: { createdAt: 'desc' } }, history: { orderBy: { createdAt: 'asc' } } } });
    if (!appeal) throw new NotFoundException('Public appeal not found');
    return this.publicAppeal(appeal);
  }

  async create(input: { type: AppealType; title: string; description: string; wardId: string; categoryId: string; latitude?: number; longitude?: number; imageUrl?: string; authorName?: string; contact?: string; isAnonymous?: boolean }, authorTokenHash: string) {
    const title = input.title?.trim(); const description = input.description?.trim();
    if (!title || title.length > 180 || !description || description.length > 10_000 || !input.wardId?.trim() || !input.categoryId) throw new BadRequestException('Title, description, ward, and category are required');
    if (!/^[1-7]$/.test(input.wardId.trim())) throw new BadRequestException('Select a valid ward (1–7)');
    if (!Object.values(AppealType).includes(input.type)) throw new BadRequestException('Invalid appeal type');
    if (input.latitude !== undefined && (input.latitude < -90 || input.latitude > 90)) throw new BadRequestException('Invalid latitude');
    if (input.longitude !== undefined && (input.longitude < -180 || input.longitude > 180)) throw new BadRequestException('Invalid longitude');
    if ((input.latitude === undefined) !== (input.longitude === undefined)) throw new BadRequestException('Both coordinates are required');
    if (input.imageUrl && !/^\/api\/uploads\/appeals\/[a-f0-9-]{36}\.(jpg|png|webp)$/.test(input.imageUrl)) throw new BadRequestException('Upload an image using the image upload endpoint');
    const category = await this.prisma.appealCategory.findFirst({ where: { id: input.categoryId, isActive: true } });
    if (!category) throw new BadRequestException('Category not found');
    const referenceId = `JAA-${randomBytes(4).toString('hex').slice(0, 6).toUpperCase()}`;
    const appeal = await this.prisma.publicAppeal.create({ data: { type: input.type, title, description, wardId: input.wardId.trim(), categoryId: input.categoryId, latitude: input.latitude, longitude: input.longitude, imageUrl: input.imageUrl, authorName: input.isAnonymous ? null : input.authorName?.trim().slice(0, 100), authorId: authorTokenHash, contact: input.contact?.trim().slice(0, 200), isAnonymous: input.isAnonymous ?? true, referenceId, status: AppealStatus.PENDING, history: { create: { status: AppealStatus.PENDING, note: 'Submitted for review', createdBy: 'citizen' } } }, include: { category: true } });
    return this.publicAppeal(appeal);
  }

  async listMine(authorTokenHash: string) {
    const items = await this.prisma.publicAppeal.findMany({ where: { authorId: authorTokenHash }, include: { category: true, history: { orderBy: { createdAt: 'desc' }, take: 1 } }, orderBy: { createdAt: 'desc' } });
    return items.map(({ contact: _contact, authorId: _authorId, history, ...appeal }) => ({ ...appeal, latestUpdate: history[0] ?? null }));
  }

  async toggleVote(id: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const appeal = await tx.publicAppeal.findFirst({ where: { id, status: { in: publicStatuses } }, select: { id: true } });
      if (!appeal) throw new NotFoundException('Public appeal not found');
      const existing = await tx.appealVote.findUnique({ where: { appealId_userId: { appealId: id, userId } } });
      if (existing) {
        await tx.appealVote.delete({ where: { id: existing.id } });
        await tx.publicAppeal.update({ where: { id }, data: { supportCount: { decrement: 1 } } });
      } else {
        await tx.appealVote.create({ data: { appealId: id, userId } });
        await tx.publicAppeal.update({ where: { id }, data: { supportCount: { increment: 1 } } });
      }
      const supportCount = await tx.appealVote.count({ where: { appealId: id } });
      return { voted: !existing, supportCount };
    });
  }

  async voteStatus(id: string, userId: string) {
    if (!(await this.prisma.publicAppeal.findFirst({ where: { id, status: { in: publicStatuses } }, select: { id: true } }))) throw new NotFoundException('Public appeal not found');
    const vote = await this.prisma.appealVote.findUnique({ where: { appealId_userId: { appealId: id, userId } }, select: { id: true } });
    return { voted: Boolean(vote) };
  }

  async comment(id: string, content: string, userId: string, parentId?: string) {
    const clean = content?.trim();
    if (!clean || clean.length > 3000) throw new BadRequestException('Comment must contain 1 to 3000 characters');
    await this.findPublic(id);
    if (parentId) {
      const parent = await this.prisma.appealComment.findFirst({ where: { id: parentId, appealId: id, status: CommentStatus.VISIBLE } });
      if (!parent) throw new BadRequestException('Reply target is unavailable');
    }
    return this.prisma.appealComment.create({ data: { appealId: id, userId, parentId, content: clean, status: CommentStatus.PENDING } });
  }

  async report(id: string, reason: string, description?: string, reportedBy?: string, commentId?: string) {
    if (!['Spam', 'False information', 'Abusive content', 'Personal information', 'Duplicate issue', 'Other'].includes(reason)) throw new BadRequestException('Select a valid report reason');
    await this.findPublic(id);
    if (commentId && !(await this.prisma.appealComment.findFirst({ where: { id: commentId, appealId: id } }))) throw new BadRequestException('Comment not found');
    return this.prisma.appealReport.create({ data: { appealId: id, commentId, reason, description: description?.trim().slice(0, 2000), reportedBy } });
  }

  adminList(status?: AppealStatus) { return this.prisma.publicAppeal.findMany({ where: status ? { status } : undefined, include: { category: true, comments: { orderBy: { createdAt: 'desc' } }, history: { orderBy: { createdAt: 'desc' } }, responses: { orderBy: { createdAt: 'desc' } }, reports: { orderBy: { createdAt: 'desc' } } }, orderBy: { createdAt: 'desc' } }); }
  async adminDetail(id: string) { const appeal = await this.prisma.publicAppeal.findUnique({ where: { id }, include: { category: true, comments: { orderBy: { createdAt: 'desc' } }, history: { orderBy: { createdAt: 'asc' } }, responses: { orderBy: { createdAt: 'desc' } }, reports: { orderBy: { createdAt: 'desc' } } } }); if (!appeal) throw new NotFoundException('Appeal not found'); return appeal; }

  async deleteAppeal(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const appeal = await tx.publicAppeal.findUnique({ where: { id }, select: { id: true } });
      if (!appeal) throw new NotFoundException('Appeal not found');
      await tx.appealStatusHistory.deleteMany({ where: { appealId: id } });
      await tx.publicAppeal.delete({ where: { id } });
      return { deleted: true };
    });
  }

  async changeStatus(id: string, status: AppealStatus, note?: string, createdBy = 'admin') {
    if (!Object.values(AppealStatus).includes(status)) throw new BadRequestException('Invalid status');
    if (status === AppealStatus.RESOLVED && !note?.trim()) throw new BadRequestException('A resolution note is required');
    return this.prisma.$transaction(async (tx) => {
      const appeal = await tx.publicAppeal.update({ where: { id }, data: { status, publishedAt: status === AppealStatus.APPROVED ? new Date() : undefined, resolvedAt: status === AppealStatus.RESOLVED ? new Date() : undefined, resolutionNote: status === AppealStatus.RESOLVED ? note?.trim() : undefined } });
      await tx.appealStatusHistory.create({ data: { appealId: id, status, note: note?.trim(), createdBy } });
      return appeal;
    });
  }

  async edit(id: string, input: { title?: string; description?: string; wardId?: string; categoryId?: string; type?: AppealType }) {
    const data: Prisma.PublicAppealUpdateInput = {};
    if (input.title !== undefined) { if (!input.title.trim() || input.title.length > 180) throw new BadRequestException('Invalid title'); data.title = input.title.trim(); }
    if (input.description !== undefined) { if (!input.description.trim() || input.description.length > 10_000) throw new BadRequestException('Invalid description'); data.description = input.description.trim(); }
    if (input.wardId !== undefined) { if (!/^[1-7]$/.test(input.wardId.trim())) throw new BadRequestException('Select a valid ward (1–7)'); data.wardId = input.wardId.trim(); }
    if (input.categoryId !== undefined) { if (!(await this.prisma.appealCategory.findFirst({ where: { id: input.categoryId, isActive: true } }))) throw new BadRequestException('Category not found'); data.category = { connect: { id: input.categoryId } }; }
    if (input.type !== undefined && Object.values(AppealType).includes(input.type)) data.type = input.type;
    return this.prisma.publicAppeal.update({ where: { id }, data, include: { category: true } });
  }

  async response(id: string, response: string, respondedBy = 'admin') { if (!response?.trim() || response.length > 5000) throw new BadRequestException('Response must contain 1 to 5000 characters'); const appeal = await this.prisma.publicAppeal.findUnique({ where: { id } }); if (!appeal) throw new NotFoundException('Appeal not found'); if (appeal.status === AppealStatus.PENDING || appeal.status === AppealStatus.REJECTED || appeal.status === AppealStatus.ARCHIVED) throw new BadRequestException('Approve the appeal before responding publicly'); return this.prisma.appealResponse.create({ data: { appealId: id, response: response.trim(), respondedBy } }); }
  async resolve(id: string, note: string, mediaUrl?: string) { if (!note?.trim()) throw new BadRequestException('A resolution note is required'); await this.changeStatus(id, AppealStatus.RESOLVED, note); if (mediaUrl) await this.prisma.publicAppeal.update({ where: { id }, data: { resolutionMediaUrl: mediaUrl } }); return { resolved: true }; }

  async moderateComment(id: string, status: CommentStatus) {
    if (!( [CommentStatus.VISIBLE, CommentStatus.HIDDEN, CommentStatus.DELETED] as CommentStatus[]).includes(status)) throw new BadRequestException('Invalid comment moderation status');
    return this.prisma.$transaction(async (tx) => {
      const comment = await tx.appealComment.findUnique({ where: { id } }); if (!comment) throw new NotFoundException('Comment not found');
      const changed = await tx.appealComment.update({ where: { id }, data: { status } });
      const commentCount = await tx.appealComment.count({ where: { appealId: comment.appealId, status: CommentStatus.VISIBLE } });
      await tx.publicAppeal.update({ where: { id: comment.appealId }, data: { commentCount } });
      return changed;
    });
  }
  async moderateReport(id: string, status: ReportStatus) { if (!Object.values(ReportStatus).includes(status)) throw new BadRequestException('Invalid report status'); return this.prisma.appealReport.update({ where: { id }, data: { status, resolvedAt: status === ReportStatus.RESOLVED || status === ReportStatus.DISMISSED ? new Date() : null } }); }
  async adminReports() { return this.prisma.appealReport.findMany({ include: { appeal: { select: { id: true, title: true, referenceId: true } }, comment: true }, orderBy: { createdAt: 'desc' } }); }

  async saveCategory(input: { id?: string; nameNp: string; nameEn: string; slug?: string; icon?: string; isActive?: boolean }) {
    const nameNp = input.nameNp?.trim(); const nameEn = input.nameEn?.trim();
    if (!nameNp || !nameEn) throw new BadRequestException('Nepali and English names are required');
    const slug = (input.slug?.trim() || nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')).slice(0, 60);
    if (!slug) throw new BadRequestException('Category slug is required');
    const data = { nameNp: nameNp.slice(0, 100), nameEn: nameEn.slice(0, 100), slug, icon: input.icon?.slice(0, 12), isActive: input.isActive ?? true };
    return input.id ? this.prisma.appealCategory.update({ where: { id: input.id }, data }) : this.prisma.appealCategory.create({ data });
  }
  async removeCategory(id: string) { return this.prisma.appealCategory.update({ where: { id }, data: { isActive: false } }); }

  async analytics() {
    const [total, grouped, votes, comments] = await Promise.all([
      this.prisma.publicAppeal.count(),
      this.prisma.publicAppeal.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.appealVote.count(), this.prisma.appealComment.count({ where: { status: CommentStatus.VISIBLE } }),
    ]);
    const [byWard, byCategory, dateRows] = await Promise.all([
      this.prisma.publicAppeal.groupBy({ by: ['wardId'], _count: { _all: true }, orderBy: { _count: { id: 'desc' } } }),
      this.prisma.publicAppeal.groupBy({ by: ['categoryId'], _count: { _all: true } }),
      this.prisma.publicAppeal.findMany({ select: { createdAt: true }, orderBy: { createdAt: 'asc' } }),
    ]);
    const monthCounts = new Map<string, number>();
    for (const row of dateRows) { const month = row.createdAt.toISOString().slice(0, 7); monthCounts.set(month, (monthCounts.get(month) ?? 0) + 1); }
    const byDay = [...monthCounts].map(([month, count]) => ({ month, count })).slice(-12);
    return { total, pending: grouped.find((x) => x.status === AppealStatus.PENDING)?._count._all ?? 0, inProgress: grouped.find((x) => x.status === AppealStatus.IN_PROGRESS)?._count._all ?? 0, resolved: grouped.find((x) => x.status === AppealStatus.RESOLVED)?._count._all ?? 0, rejected: grouped.find((x) => x.status === AppealStatus.REJECTED)?._count._all ?? 0, votes, comments, byStatus: grouped, byWard, byCategory, byDay };
  }

  async similar(title: string, description: string, wardId?: string) {
    const term = title.trim().split(/\s+/).filter((word) => word.length > 3).slice(0, 3);
    if (!term.length) return [];
    return this.prisma.publicAppeal.findMany({ where: { status: { in: publicStatuses }, ...(wardId ? { wardId } : {}), OR: term.map((word) => ({ title: { contains: word } })) }, include: { category: true }, take: 5, orderBy: { createdAt: 'desc' } }).then((items) => items.map((item) => this.publicAppeal(item)));
  }

  private publicAppeal<T extends { authorId?: string | null; authorName?: string | null; contact?: string | null; isAnonymous?: boolean; latitude?: unknown; longitude?: unknown }>(item: T): Omit<T, 'authorId' | 'contact' | 'latitude' | 'longitude' | 'authorName'> & { authorName: string | null; latitude?: number | null; longitude?: number | null } {
    const { authorId: _authorId, contact: _contact, ...safe } = item;
    const latitude = item.latitude == null ? item.latitude as null | undefined : Math.round(Number(item.latitude) * 100) / 100;
    const longitude = item.longitude == null ? item.longitude as null | undefined : Math.round(Number(item.longitude) * 100) / 100;
    const output = { ...safe, latitude, longitude, authorName: item.isAnonymous ? null : item.authorName ?? null } as Omit<T, 'authorId' | 'contact' | 'latitude' | 'longitude' | 'authorName'> & { authorName: string | null; latitude?: number | null; longitude?: number | null };
    if ('comments' in output && Array.isArray(output.comments)) output.comments = output.comments.map(({ userId: _userId, ...comment }) => comment);
    return output;
  }
}
