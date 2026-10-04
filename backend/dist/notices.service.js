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
exports.NoticesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./prisma.service");
const PublicationStatus = { DRAFT: 'DRAFT', PUBLISHED: 'PUBLISHED' };
let NoticesService = class NoticesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list() {
        const notices = await this.prisma.notice.findMany({
            where: { sourceMetadataId: null, status: PublicationStatus.PUBLISHED },
            orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
        });
        return notices.map((notice) => this.toRecord(notice));
    }
    async create(input) {
        const title = input.title?.trim();
        if (!title)
            throw new common_1.BadRequestException('Notice title is required');
        const notice = await this.prisma.notice.create({
            data: {
                titleEn: title.slice(0, 240),
                summary: input.summary?.trim().slice(0, 10_000) ?? '',
                imageUrl: this.imageValue(input.imageUrl),
                detailUrl: '/',
                status: input.published ? PublicationStatus.PUBLISHED : PublicationStatus.DRAFT,
                publishedAt: input.published ? new Date() : null,
            },
        });
        return this.toRecord(notice);
    }
    async update(id, input) {
        const existing = await this.prisma.notice.findFirst({ where: { id, sourceMetadataId: null } });
        if (!existing)
            throw new common_1.NotFoundException('Notice not found');
        if (input.title !== undefined && !input.title.trim())
            throw new common_1.BadRequestException('Notice title is required');
        const notice = await this.prisma.notice.update({
            where: { id },
            data: {
                ...(input.title === undefined ? {} : { titleEn: input.title.trim().slice(0, 240) }),
                ...(input.summary === undefined ? {} : { summary: input.summary.trim().slice(0, 10_000) }),
                ...(input.imageUrl === undefined ? {} : { imageUrl: this.imageValue(input.imageUrl) }),
                ...(input.published === undefined ? {} : {
                    status: input.published ? PublicationStatus.PUBLISHED : PublicationStatus.DRAFT,
                    publishedAt: input.published ? new Date() : null,
                }),
            },
        });
        return this.toRecord(notice);
    }
    async remove(id) {
        const result = await this.prisma.notice.deleteMany({ where: { id, sourceMetadataId: null } });
        if (result.count === 0)
            throw new common_1.NotFoundException('Notice not found');
        return { deleted: true };
    }
    imageValue(value) {
        if (!value)
            return null;
        if (!value.startsWith('data:image/') || value.length > 12_000_000)
            throw new common_1.BadRequestException('Notice image must be a supported image under 9 MB');
        return value;
    }
    toRecord(notice) {
        return {
            id: notice.id,
            title: notice.titleEn ?? notice.titleNp ?? '',
            summary: notice.summary,
            imageUrl: notice.imageUrl ?? undefined,
            published: notice.status === PublicationStatus.PUBLISHED,
            updatedAt: (notice.publishedAt ?? notice.updatedAt ?? notice.createdAt).toISOString(),
        };
    }
};
exports.NoticesService = NoticesService;
exports.NoticesService = NoticesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NoticesService);
//# sourceMappingURL=notices.service.js.map