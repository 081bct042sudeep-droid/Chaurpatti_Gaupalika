"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppealsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("./prisma.service");
const defaultCategories = [
    ['खानेपानी', 'Water', 'water', '🚰'], ['सडक', 'Roads', 'roads', '🛣️'], ['शिक्षा', 'Education', 'education', '📚'],
    ['स्वास्थ्य', 'Health', 'health', '♥'], ['सरसफाइ', 'Sanitation', 'sanitation', '♻'], ['अन्य', 'Other', 'other', '◌'],
];
let AppealsService = class AppealsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async categories() {
        const count = await this.prisma.appealCategory.count();
        if (!count)
            await this.prisma.appealCategory.createMany({ data: defaultCategories.map(([nameNp, nameEn, slug, icon]) => ({ nameNp, nameEn, slug, icon })) });
        return this.prisma.appealCategory.findMany({ where: { isActive: true }, orderBy: { nameNp: 'asc' } });
    }
    async listPublic(query) {
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.min(50, Math.max(1, Number(query.limit) || 20));
        const where = { status: { in: [client_1.AppealStatus.APPROVED, client_1.AppealStatus.IN_PROGRESS, client_1.AppealStatus.RESOLVED] } };
        if (query.wardId)
            where.wardId = query.wardId;
        if (query.categoryId)
            where.categoryId = query.categoryId;
        if (query.type)
            where.type = query.type;
        if (query.status)
            where.status = query.status;
        const orderBy = query.sort === 'support' ? { supportCount: 'desc' } : query.sort === 'comments' ? { commentCount: 'desc' } : { createdAt: 'desc' };
        const [items, total] = await this.prisma.$transaction([
            this.prisma.publicAppeal.findMany({ where, include: { category: true }, orderBy, skip: (page - 1) * limit, take: limit }),
            this.prisma.publicAppeal.count({ where }),
        ]);
        return { items, total, page, limit, pages: Math.ceil(total / limit) };
    }
    async findPublic(id) {
        const appeal = await this.prisma.publicAppeal.findFirst({ where: { id, status: { not: client_1.AppealStatus.PENDING } }, include: { category: true, comments: { where: { status: 'VISIBLE' }, orderBy: { createdAt: 'asc' } }, responses: { orderBy: { createdAt: 'desc' } }, history: { orderBy: { createdAt: 'asc' } } } });
        if (!appeal)
            throw new common_1.NotFoundException('Public appeal not found');
        return appeal;
    }
    async create(input) {
        if (!input.title?.trim() || !input.description?.trim() || !input.categoryId)
            throw new common_1.BadRequestException('Title, description, and category are required');
        if (input.imageUrl && (!input.imageUrl.startsWith('data:image/') || input.imageUrl.length > 8_000_000))
            throw new common_1.BadRequestException('Invalid or oversized image');
        const category = await this.prisma.appealCategory.findUnique({ where: { id: input.categoryId } });
        if (!category)
            throw new common_1.BadRequestException('Category not found');
        const referenceId = `JAA-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
        return this.prisma.publicAppeal.create({ data: { ...input, referenceId, status: client_1.AppealStatus.PENDING, title: input.title.trim(), description: input.description.trim(), history: { create: { status: client_1.AppealStatus.PENDING, note: 'Submitted by citizen' } } }, include: { category: true } });
    }
    async toggleVote(id, userId) {
        if (!userId)
            throw new common_1.BadRequestException('A visitor identifier is required');
        return this.prisma.$transaction(async (tx) => {
            const existing = await tx.appealVote.findUnique({ where: { appealId_userId: { appealId: id, userId } } });
            if (existing) {
                await tx.appealVote.delete({ where: { id: existing.id } });
                await tx.publicAppeal.update({ where: { id }, data: { supportCount: { decrement: 1 } } });
                return { voted: false };
            }
            await tx.appealVote.create({ data: { appealId: id, userId } });
            await tx.publicAppeal.update({ where: { id }, data: { supportCount: { increment: 1 } } });
            return { voted: true };
        });
    }
    async comment(id, content, userId) {
        if (!content?.trim())
            throw new common_1.BadRequestException('Comment is required');
        return this.prisma.$transaction(async (tx) => { const comment = await tx.appealComment.create({ data: { appealId: id, userId, content: content.trim(), status: 'PENDING' } }); await tx.publicAppeal.update({ where: { id }, data: { commentCount: { increment: 1 } } }); return comment; });
    }
    async report(id, reason, description, reportedBy) { return this.prisma.appealReport.create({ data: { appealId: id, reason, description, reportedBy } }); }
    async adminList(status) { return this.prisma.publicAppeal.findMany({ where: status ? { status } : undefined, include: { category: true, comments: true, history: { orderBy: { createdAt: 'desc' } } }, orderBy: { createdAt: 'desc' } }); }
    async changeStatus(id, status, note, createdBy = 'admin') {
        const data = { status, publishedAt: status === client_1.AppealStatus.APPROVED ? new Date() : undefined, resolvedAt: status === client_1.AppealStatus.RESOLVED ? new Date() : undefined };
        return this.prisma.$transaction(async (tx) => { const appeal = await tx.publicAppeal.update({ where: { id }, data }); await tx.appealStatusHistory.create({ data: { appealId: id, status, note, createdBy } }); return appeal; });
    }
    async response(id, response, respondedBy = 'admin') { if (!response?.trim())
        throw new common_1.BadRequestException('Response is required'); return this.prisma.appealResponse.create({ data: { appealId: id, response: response.trim(), respondedBy } }); }
    async resolve(id, note, createdBy = 'admin') { await this.changeStatus(id, client_1.AppealStatus.RESOLVED, note, createdBy); return { resolved: true }; }
};
exports.AppealsService = AppealsService;
exports.AppealsService = AppealsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AppealsService);
//# sourceMappingURL=appeals.service.js.map