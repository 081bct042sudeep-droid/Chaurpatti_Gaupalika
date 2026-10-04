import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma.service';

const PublicationStatus = { DRAFT: 'DRAFT', PUBLISHED: 'PUBLISHED' } as const;
type PublicationStatus = (typeof PublicationStatus)[keyof typeof PublicationStatus];

export type NoticeRecord = {
  id: string;
  title: string;
  summary: string;
  imageUrl?: string;
  published: boolean;
  updatedAt: string;
};

type NoticeInput = Omit<NoticeRecord, 'id' | 'updatedAt'>;

@Injectable()
export class NoticesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<NoticeRecord[]> {
    const notices = await this.prisma.notice.findMany({
      where: { sourceMetadataId: null, status: PublicationStatus.PUBLISHED },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    });
    return notices.map((notice) => this.toRecord(notice));
  }

  async create(input: NoticeInput): Promise<NoticeRecord> {
    const title = input.title?.trim();
    if (!title) throw new BadRequestException('Notice title is required');
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

  async update(id: string, input: Partial<NoticeInput>): Promise<NoticeRecord> {
    const existing = await this.prisma.notice.findFirst({ where: { id, sourceMetadataId: null } });
    if (!existing) throw new NotFoundException('Notice not found');
    if (input.title !== undefined && !input.title.trim()) throw new BadRequestException('Notice title is required');
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

  async remove(id: string) {
    const result = await this.prisma.notice.deleteMany({ where: { id, sourceMetadataId: null } });
    if (result.count === 0) throw new NotFoundException('Notice not found');
    return { deleted: true };
  }

  private imageValue(value?: string) {
    if (!value) return null;
    if (!value.startsWith('data:image/') || value.length > 12_000_000) throw new BadRequestException('Notice image must be a supported image under 9 MB');
    return value;
  }

  private toRecord(notice: { id: string; titleNp: string | null; titleEn: string | null; summary: string; imageUrl: string | null; status: string; publishedAt: Date | null; updatedAt: Date; createdAt: Date }): NoticeRecord {
    return {
      id: notice.id,
      title: notice.titleEn ?? notice.titleNp ?? '',
      summary: notice.summary,
      imageUrl: notice.imageUrl ?? undefined,
      published: notice.status === PublicationStatus.PUBLISHED,
      updatedAt: (notice.publishedAt ?? notice.updatedAt ?? notice.createdAt).toISOString(),
    };
  }
}
