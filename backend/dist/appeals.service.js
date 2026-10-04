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
const appeal_enums_1 = require("./appeal-enums");
const node_crypto_1 = require("node:crypto");
const prisma_service_1 = require("./prisma.service");
const publicStatuses = [appeal_enums_1.AppealStatus.APPROVED, appeal_enums_1.AppealStatus.UNDER_REVIEW, appeal_enums_1.AppealStatus.FORWARDED, appeal_enums_1.AppealStatus.IN_PROGRESS, appeal_enums_1.AppealStatus.RESOLVED];
const defaultCategories = [
    ['खानेपानी', 'Water', 'water', '🚰'], ['सडक', 'Roads', 'roads', '🛣️'], ['शिक्षा', 'Education', 'education', '📚'],
    ['स्वास्थ्य', 'Health', 'health', '♥'], ['विद्युत', 'Electricity', 'electricity', '⚡'], ['कृषि', 'Agriculture', 'agriculture', '🌱'],
    ['पूर्वाधार', 'Infrastructure', 'infrastructure', '🏗️'], ['सरसफाइ', 'Sanitation', 'sanitation', '♻'], ['वातावरण', 'Environment', 'environment', '🌿'],
    ['यातायात', 'Transport', 'transport', '🚌'], ['सञ्चार/इन्टरनेट', 'Internet', 'internet', '📶'], ['सार्वजनिक सेवा', 'Public services', 'public-services', '🏛️'],
    ['पर्यटन', 'Tourism', 'tourism', '🏞️'], ['अन्य', 'Other', 'other', '○'],
];
let AppealsService = class AppealsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async categories() {
        if (!(await this.prisma.appealCategory.count())) {
            await this.prisma.appealCategory.createMany({ data: defaultCategories.map(([nameNp, nameEn, slug, icon]) => ({ nameNp, nameEn, slug, icon })) });
        }
        return this.prisma.appealCategory.findMany({ where: { isActive: true }, orderBy: { nameNp: 'asc' } });
    }
    adminCategories() { return this.prisma.appealCategory.findMany({ orderBy: { nameNp: 'asc' } }); }
    async listPublic(query) {
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.min(50, Math.max(1, Number(query.limit) || 20));
        const where = { status: { in: publicStatuses } };
        if (query.wardId)
            where.wardId = query.wardId;
        if (query.categoryId) {
            const category = await this.prisma.appealCategory.findFirst({ where: { OR: [{ id: query.categoryId }, { slug: query.categoryId }] }, select: { id: true } });
            where.categoryId = category?.id ?? '__unknown_category__';
        }
        if (query.type && Object.values(appeal_enums_1.AppealType).includes(query.type))
            where.type = query.type;
        if (query.status && publicStatuses.includes(query.status))
            where.status = query.status;
        if (query.search?.trim())
            where.OR = [{ title: { contains: query.search.trim().slice(0, 100) } }, { description: { contains: query.search.trim().slice(0, 100) } }];
        const orderBy = query.sort === 'support' ? [{ supportCount: 'desc' }, { createdAt: 'desc' }] : query.sort === 'comments' ? [{ commentCount: 'desc' }, { createdAt: 'desc' }] : { createdAt: 'desc' };
        const [items, total] = await this.prisma.$transaction([
            this.prisma.publicAppeal.findMany({ where, include: { category: true }, orderBy, skip: (page - 1) * limit, take: limit }),
            this.prisma.publicAppeal.count({ where }),
        ]);
        return { items: items.map((appeal) => this.publicAppeal(appeal)), total, page, limit, pages: Math.ceil(total / limit) };
    }
    async findPublic(id) {
        const appeal = await this.prisma.publicAppeal.findFirst({ where: { id, status: { in: publicStatuses } }, include: { category: true, comments: { where: { status: appeal_enums_1.CommentStatus.VISIBLE }, orderBy: { createdAt: 'asc' } }, responses: { orderBy: { createdAt: 'desc' } }, history: { orderBy: { createdAt: 'asc' } } } });
        if (!appeal)
            throw new common_1.NotFoundException('Public appeal not found');
        return this.publicAppeal(appeal);
    }
    async create(input, authorTokenHash) {
        const title = input.title?.trim();
        const description = input.description?.trim();
        if (!title || title.length > 180 || !description || description.length > 10_000 || !input.wardId?.trim() || !input.categoryId)
            throw new common_1.BadRequestException('Title, description, ward, and category are required');
        if (!/^[1-7]$/.test(input.wardId.trim()))
            throw new common_1.BadRequestException('Select a valid ward (1–7)');
        if (!Object.values(appeal_enums_1.AppealType).includes(input.type))
            throw new common_1.BadRequestException('Invalid appeal type');
        if (input.latitude !== undefined && (input.latitude < -90 || input.latitude > 90))
            throw new common_1.BadRequestException('Invalid latitude');
        if (input.longitude !== undefined && (input.longitude < -180 || input.longitude > 180))
            throw new common_1.BadRequestException('Invalid longitude');
        if ((input.latitude === undefined) !== (input.longitude === undefined))
            throw new common_1.BadRequestException('Both coordinates are required');
        if (input.imageUrl && !/^\/api\/uploads\/appeals\/[a-f0-9-]{36}\.(jpg|png|webp)$/.test(input.imageUrl))
            throw new common_1.BadRequestException('Upload an image using the image upload endpoint');
        const category = await this.prisma.appealCategory.findFirst({ where: { id: input.categoryId, isActive: true } });
        if (!category)
            throw new common_1.BadRequestException('Category not found');
        const referenceId = `JAA-${(0, node_crypto_1.randomBytes)(4).toString('hex').slice(0, 6).toUpperCase()}`;
        const appeal = await this.prisma.publicAppeal.create({ data: { type: input.type, title, description, wardId: input.wardId.trim(), categoryId: input.categoryId, latitude: input.latitude, longitude: input.longitude, imageUrl: input.imageUrl, authorName: input.isAnonymous ? null : input.authorName?.trim().slice(0, 100), authorId: authorTokenHash, contact: input.contact?.trim().slice(0, 200), isAnonymous: input.isAnonymous ?? true, referenceId, status: appeal_enums_1.AppealStatus.PENDING, history: { create: { status: appeal_enums_1.AppealStatus.PENDING, note: 'Submitted for review', createdBy: 'citizen' } } }, include: { category: true } });
        return this.publicAppeal(appeal);
    }
    async listMine(authorTokenHash) {
        const items = await this.prisma.publicAppeal.findMany({ where: { authorId: authorTokenHash }, include: { category: true, history: { orderBy: { createdAt: 'desc' }, take: 1 } }, orderBy: { createdAt: 'desc' } });
        return items.map(({ contact: _contact, authorId: _authorId, history, ...appeal }) => ({ ...appeal, latestUpdate: history[0] ?? null }));
    }
    async toggleVote(id, userId) {
        return this.prisma.$transaction(async (tx) => {
            const appeal = await tx.publicAppeal.findFirst({ where: { id, status: { in: publicStatuses } }, select: { id: true } });
            if (!appeal)
                throw new common_1.NotFoundException('Public appeal not found');
            const existing = await tx.appealVote.findUnique({ where: { appealId_userId: { appealId: id, userId } } });
            if (existing) {
                await tx.appealVote.delete({ where: { id: existing.id } });
                await tx.publicAppeal.update({ where: { id }, data: { supportCount: { decrement: 1 } } });
            }
            else {
                await tx.appealVote.create({ data: { appealId: id, userId } });
                await tx.publicAppeal.update({ where: { id }, data: { supportCount: { increment: 1 } } });
            }
            const supportCount = await tx.appealVote.count({ where: { appealId: id } });
            return { voted: !existing, supportCount };
        });
    }
    async voteStatus(id, userId) {
        if (!(await this.prisma.publicAppeal.findFirst({ where: { id, status: { in: publicStatuses } }, select: { id: true } })))
            throw new common_1.NotFoundException('Public appeal not found');
        const vote = await this.prisma.appealVote.findUnique({ where: { appealId_userId: { appealId: id, userId } }, select: { id: true } });
        return { voted: Boolean(vote) };
    }
    async comment(id, content, userId, parentId) {
        const clean = content?.trim();
        if (!clean || clean.length > 3000)
            throw new common_1.BadRequestException('Comment must contain 1 to 3000 characters');
        await this.findPublic(id);
        if (parentId) {
            const parent = await this.prisma.appealComment.findFirst({ where: { id: parentId, appealId: id, status: appeal_enums_1.CommentStatus.VISIBLE } });
            if (!parent)
                throw new common_1.BadRequestException('Reply target is unavailable');
        }
        return this.prisma.appealComment.create({ data: { appealId: id, userId, parentId, content: clean, status: appeal_enums_1.CommentStatus.PENDING } });
    }
    async report(id, reason, description, reportedBy, commentId) {
        if (!['Spam', 'False information', 'Abusive content', 'Personal information', 'Duplicate issue', 'Other'].includes(reason))
            throw new common_1.BadRequestException('Select a valid report reason');
        await this.findPublic(id);
        if (commentId && !(await this.prisma.appealComment.findFirst({ where: { id: commentId, appealId: id } })))
            throw new common_1.BadRequestException('Comment not found');
        return this.prisma.appealReport.create({ data: { appealId: id, commentId, reason, description: description?.trim().slice(0, 2000), reportedBy } });
    }
    adminList(status) { return this.prisma.publicAppeal.findMany({ where: status ? { status } : undefined, include: { category: true, comments: { orderBy: { createdAt: 'desc' } }, history: { orderBy: { createdAt: 'desc' } }, responses: { orderBy: { createdAt: 'desc' } }, reports: { orderBy: { createdAt: 'desc' } } }, orderBy: { createdAt: 'desc' } }); }
    async adminDetail(id) { const appeal = await this.prisma.publicAppeal.findUnique({ where: { id }, include: { category: true, comments: { orderBy: { createdAt: 'desc' } }, history: { orderBy: { createdAt: 'asc' } }, responses: { orderBy: { createdAt: 'desc' } }, reports: { orderBy: { createdAt: 'desc' } } } }); if (!appeal)
        throw new common_1.NotFoundException('Appeal not found'); return appeal; }
    async deleteAppeal(id) {
        return this.prisma.$transaction(async (tx) => {
            const appeal = await tx.publicAppeal.findUnique({ where: { id }, select: { id: true } });
            if (!appeal)
                throw new common_1.NotFoundException('Appeal not found');
            await tx.appealStatusHistory.deleteMany({ where: { appealId: id } });
            await tx.publicAppeal.delete({ where: { id } });
            return { deleted: true };
        });
    }
    async changeStatus(id, status, note, createdBy = 'admin') {
        if (!Object.values(appeal_enums_1.AppealStatus).includes(status))
            throw new common_1.BadRequestException('Invalid status');
        if (status === appeal_enums_1.AppealStatus.RESOLVED && !note?.trim())
            throw new common_1.BadRequestException('A resolution note is required');
        return this.prisma.$transaction(async (tx) => {
            const appeal = await tx.publicAppeal.update({ where: { id }, data: { status, publishedAt: status === appeal_enums_1.AppealStatus.APPROVED ? new Date() : undefined, resolvedAt: status === appeal_enums_1.AppealStatus.RESOLVED ? new Date() : undefined, resolutionNote: status === appeal_enums_1.AppealStatus.RESOLVED ? note?.trim() : undefined } });
            await tx.appealStatusHistory.create({ data: { appealId: id, status, note: note?.trim(), createdBy } });
            return appeal;
        });
    }
    async edit(id, input) {
        const data = {};
        if (input.title !== undefined) {
            if (!input.title.trim() || input.title.length > 180)
                throw new common_1.BadRequestException('Invalid title');
            data.title = input.title.trim();
        }
        if (input.description !== undefined) {
            if (!input.description.trim() || input.description.length > 10_000)
                throw new common_1.BadRequestException('Invalid description');
            data.description = input.description.trim();
        }
        if (input.wardId !== undefined) {
            if (!/^[1-7]$/.test(input.wardId.trim()))
                throw new common_1.BadRequestException('Select a valid ward (1–7)');
            data.wardId = input.wardId.trim();
        }
        if (input.categoryId !== undefined) {
            if (!(await this.prisma.appealCategory.findFirst({ where: { id: input.categoryId, isActive: true } })))
                throw new common_1.BadRequestException('Category not found');
            data.category = { connect: { id: input.categoryId } };
        }
        if (input.type !== undefined && Object.values(appeal_enums_1.AppealType).includes(input.type))
            data.type = input.type;
        return this.prisma.publicAppeal.update({ where: { id }, data, include: { category: true } });
    }
    async response(id, response, respondedBy = 'admin') { if (!response?.trim() || response.length > 5000)
        throw new common_1.BadRequestException('Response must contain 1 to 5000 characters'); const appeal = await this.prisma.publicAppeal.findUnique({ where: { id } }); if (!appeal)
        throw new common_1.NotFoundException('Appeal not found'); if (appeal.status === appeal_enums_1.AppealStatus.PENDING || appeal.status === appeal_enums_1.AppealStatus.REJECTED || appeal.status === appeal_enums_1.AppealStatus.ARCHIVED)
        throw new common_1.BadRequestException('Approve the appeal before responding publicly'); return this.prisma.appealResponse.create({ data: { appealId: id, response: response.trim(), respondedBy } }); }
    async resolve(id, note, mediaUrl) { if (!note?.trim())
        throw new common_1.BadRequestException('A resolution note is required'); await this.changeStatus(id, appeal_enums_1.AppealStatus.RESOLVED, note); if (mediaUrl)
        await this.prisma.publicAppeal.update({ where: { id }, data: { resolutionMediaUrl: mediaUrl } }); return { resolved: true }; }
    async moderateComment(id, status) {
        if (![appeal_enums_1.CommentStatus.VISIBLE, appeal_enums_1.CommentStatus.HIDDEN, appeal_enums_1.CommentStatus.DELETED].includes(status))
            throw new common_1.BadRequestException('Invalid comment moderation status');
        return this.prisma.$transaction(async (tx) => {
            const comment = await tx.appealComment.findUnique({ where: { id } });
            if (!comment)
                throw new common_1.NotFoundException('Comment not found');
            const changed = await tx.appealComment.update({ where: { id }, data: { status } });
            const commentCount = await tx.appealComment.count({ where: { appealId: comment.appealId, status: appeal_enums_1.CommentStatus.VISIBLE } });
            await tx.publicAppeal.update({ where: { id: comment.appealId }, data: { commentCount } });
            return changed;
        });
    }
    async moderateReport(id, status) { if (!Object.values(appeal_enums_1.ReportStatus).includes(status))
        throw new common_1.BadRequestException('Invalid report status'); return this.prisma.appealReport.update({ where: { id }, data: { status, resolvedAt: status === appeal_enums_1.ReportStatus.RESOLVED || status === appeal_enums_1.ReportStatus.DISMISSED ? new Date() : null } }); }
    async adminReports() { return this.prisma.appealReport.findMany({ include: { appeal: { select: { id: true, title: true, referenceId: true } }, comment: true }, orderBy: { createdAt: 'desc' } }); }
    async saveCategory(input) {
        const nameNp = input.nameNp?.trim();
        const nameEn = input.nameEn?.trim();
        if (!nameNp || !nameEn)
            throw new common_1.BadRequestException('Nepali and English names are required');
        const slug = (input.slug?.trim() || nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')).slice(0, 60);
        if (!slug)
            throw new common_1.BadRequestException('Category slug is required');
        const data = { nameNp: nameNp.slice(0, 100), nameEn: nameEn.slice(0, 100), slug, icon: input.icon?.slice(0, 12), isActive: input.isActive ?? true };
        return input.id ? this.prisma.appealCategory.update({ where: { id: input.id }, data }) : this.prisma.appealCategory.create({ data });
    }
    async removeCategory(id) { return this.prisma.appealCategory.update({ where: { id }, data: { isActive: false } }); }
    async analytics() {
        const [total, grouped, votes, comments] = await Promise.all([
            this.prisma.publicAppeal.count(),
            this.prisma.publicAppeal.groupBy({ by: ['status'], _count: { _all: true } }),
            this.prisma.appealVote.count(), this.prisma.appealComment.count({ where: { status: appeal_enums_1.CommentStatus.VISIBLE } }),
        ]);
        const [byWard, byCategory, dateRows] = await Promise.all([
            this.prisma.publicAppeal.groupBy({ by: ['wardId'], _count: { _all: true }, orderBy: { _count: { id: 'desc' } } }),
            this.prisma.publicAppeal.groupBy({ by: ['categoryId'], _count: { _all: true } }),
            this.prisma.publicAppeal.findMany({ select: { createdAt: true }, orderBy: { createdAt: 'asc' } }),
        ]);
        const monthCounts = new Map();
        for (const row of dateRows) {
            const month = row.createdAt.toISOString().slice(0, 7);
            monthCounts.set(month, (monthCounts.get(month) ?? 0) + 1);
        }
        const byDay = [...monthCounts].map(([month, count]) => ({ month, count })).slice(-12);
        return { total, pending: grouped.find((x) => x.status === appeal_enums_1.AppealStatus.PENDING)?._count._all ?? 0, inProgress: grouped.find((x) => x.status === appeal_enums_1.AppealStatus.IN_PROGRESS)?._count._all ?? 0, resolved: grouped.find((x) => x.status === appeal_enums_1.AppealStatus.RESOLVED)?._count._all ?? 0, rejected: grouped.find((x) => x.status === appeal_enums_1.AppealStatus.REJECTED)?._count._all ?? 0, votes, comments, byStatus: grouped, byWard, byCategory, byDay };
    }
    async similar(title, description, wardId) {
        const term = title.trim().split(/\s+/).filter((word) => word.length > 3).slice(0, 3);
        if (!term.length)
            return [];
        return this.prisma.publicAppeal.findMany({ where: { status: { in: publicStatuses }, ...(wardId ? { wardId } : {}), OR: term.map((word) => ({ title: { contains: word } })) }, include: { category: true }, take: 5, orderBy: { createdAt: 'desc' } }).then((items) => items.map((item) => this.publicAppeal(item)));
    }
    publicAppeal(item) {
        const { authorId: _authorId, contact: _contact, ...safe } = item;
        const latitude = item.latitude == null ? item.latitude : Math.round(Number(item.latitude) * 100) / 100;
        const longitude = item.longitude == null ? item.longitude : Math.round(Number(item.longitude) * 100) / 100;
        const output = { ...safe, latitude, longitude, authorName: item.isAnonymous ? null : item.authorName ?? null };
        if ('comments' in output && Array.isArray(output.comments))
            output.comments = output.comments.map(({ userId: _userId, ...comment }) => comment);
        return output;
    }
};
exports.AppealsService = AppealsService;
exports.AppealsService = AppealsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AppealsService);
//# sourceMappingURL=appeals.service.js.map