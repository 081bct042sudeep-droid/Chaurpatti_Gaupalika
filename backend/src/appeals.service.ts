import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AppealStatus, AppealType, Prisma } from '@prisma/client';
import { PrismaService } from './prisma.service';

const defaultCategories = [
  ['खानेपानी', 'Water', 'water', '🚰'], ['सडक', 'Roads', 'roads', '🛣️'], ['शिक्षा', 'Education', 'education', '📚'],
  ['स्वास्थ्य', 'Health', 'health', '♥'], ['सरसफाइ', 'Sanitation', 'sanitation', '♻'], ['अन्य', 'Other', 'other', '◌'],
];

@Injectable()
export class AppealsService {
  constructor(private readonly prisma: PrismaService) {}

  async categories() {
    const count = await this.prisma.appealCategory.count();
    if (!count) await this.prisma.appealCategory.createMany({ data: defaultCategories.map(([nameNp, nameEn, slug, icon]) => ({ nameNp, nameEn, slug, icon })) });
    return this.prisma.appealCategory.findMany({ where: { isActive: true }, orderBy: { nameNp: 'asc' } });
  }

  async listPublic(query: { page?: number; limit?: number; wardId?: string; categoryId?: string; status?: AppealStatus; type?: AppealType; sort?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 20));
    const where: Prisma.PublicAppealWhereInput = { status: { in: [AppealStatus.APPROVED, AppealStatus.IN_PROGRESS, AppealStatus.RESOLVED] } };
    if (query.wardId) where.wardId = query.wardId;
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.type) where.type = query.type;
    if (query.status) where.status = query.status;
    const orderBy: Prisma.PublicAppealOrderByWithRelationInput = query.sort === 'support' ? { supportCount: 'desc' } : query.sort === 'comments' ? { commentCount: 'desc' } : { createdAt: 'desc' };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.publicAppeal.findMany({ where, include: { category: true }, orderBy, skip: (page - 1) * limit, take: limit }),
      this.prisma.publicAppeal.count({ where }),
    ]);
    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findPublic(id: string) {
    const appeal = await this.prisma.publicAppeal.findFirst({ where: { id, status: { not: AppealStatus.PENDING } }, include: { category: true, comments: { where: { status: 'VISIBLE' }, orderBy: { createdAt: 'asc' } }, responses: { orderBy: { createdAt: 'desc' } }, history: { orderBy: { createdAt: 'asc' } } } });
    if (!appeal) throw new NotFoundException('Public appeal not found');
    return appeal;
  }

  async create(input: { type: AppealType; title: string; description: string; wardId?: string; categoryId: string; latitude?: number; longitude?: number; imageUrl?: string; authorName?: string; contact?: string; isAnonymous?: boolean }) {
    if (!input.title?.trim() || !input.description?.trim() || !input.categoryId) throw new BadRequestException('Title, description, and category are required');
    if (input.imageUrl && (!input.imageUrl.startsWith('data:image/') || input.imageUrl.length > 8_000_000)) throw new BadRequestException('Invalid or oversized image');
    const category = await this.prisma.appealCategory.findUnique({ where: { id: input.categoryId } });
    if (!category) throw new BadRequestException('Category not found');
    const referenceId = `JAA-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    return this.prisma.publicAppeal.create({ data: { ...input, referenceId, status: AppealStatus.PENDING, title: input.title.trim(), description: input.description.trim(), history: { create: { status: AppealStatus.PENDING, note: 'Submitted by citizen' } } }, include: { category: true } });
  }

  async toggleVote(id: string, userId: string) {
    if (!userId) throw new BadRequestException('A visitor identifier is required');
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.appealVote.findUnique({ where: { appealId_userId: { appealId: id, userId } } });
      if (existing) { await tx.appealVote.delete({ where: { id: existing.id } }); await tx.publicAppeal.update({ where: { id }, data: { supportCount: { decrement: 1 } } }); return { voted: false }; }
      await tx.appealVote.create({ data: { appealId: id, userId } }); await tx.publicAppeal.update({ where: { id }, data: { supportCount: { increment: 1 } } }); return { voted: true };
    });
  }

  async comment(id: string, content: string, userId?: string) {
    if (!content?.trim()) throw new BadRequestException('Comment is required');
    return this.prisma.$transaction(async (tx) => { const comment = await tx.appealComment.create({ data: { appealId: id, userId, content: content.trim(), status: 'PENDING' } }); await tx.publicAppeal.update({ where: { id }, data: { commentCount: { increment: 1 } } }); return comment; });
  }

  async report(id: string, reason: string, description?: string, reportedBy?: string) { return this.prisma.appealReport.create({ data: { appealId: id, reason, description, reportedBy } }); }

  async adminList(status?: AppealStatus) { return this.prisma.publicAppeal.findMany({ where: status ? { status } : undefined, include: { category: true, comments: true, history: { orderBy: { createdAt: 'desc' } } }, orderBy: { createdAt: 'desc' } }); }

  async changeStatus(id: string, status: AppealStatus, note?: string, createdBy = 'admin') {
    const data: Prisma.PublicAppealUpdateInput = { status, publishedAt: status === AppealStatus.APPROVED ? new Date() : undefined, resolvedAt: status === AppealStatus.RESOLVED ? new Date() : undefined };
    return this.prisma.$transaction(async (tx) => { const appeal = await tx.publicAppeal.update({ where: { id }, data }); await tx.appealStatusHistory.create({ data: { appealId: id, status, note, createdBy } }); return appeal; });
  }

  async response(id: string, response: string, respondedBy = 'admin') { if (!response?.trim()) throw new BadRequestException('Response is required'); return this.prisma.appealResponse.create({ data: { appealId: id, response: response.trim(), respondedBy } }); }

  async resolve(id: string, note: string, createdBy = 'admin') { await this.changeStatus(id, AppealStatus.RESOLVED, note, createdBy); return { resolved: true }; }
}
