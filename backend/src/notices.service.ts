import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { uploadDirectory } from './upload-storage';

const PublicationStatus = { DRAFT: 'DRAFT', PUBLISHED: 'PUBLISHED' } as const;
type PublicationStatus = (typeof PublicationStatus)[keyof typeof PublicationStatus];

export type NoticeRecord = {
  id: string;
  title: string;
  summary: string;
  imageUrl?: string;
  published: boolean;
  attachmentUrl?: string;
  updatedAt: string;
};

type NoticeInput = Omit<NoticeRecord, 'id' | 'updatedAt'>;

@Injectable()
export class NoticesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<NoticeRecord[]> {
    const notices = await this.prisma.notice.findMany({
      where: { sourceMetadataId: null, status: PublicationStatus.PUBLISHED, attachmentUrl: null },
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
        attachmentUrl: this.attachmentValue(input.attachmentUrl),
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
        ...(input.attachmentUrl === undefined ? {} : { attachmentUrl: this.attachmentValue(input.attachmentUrl) }),
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

  private attachmentValue(value?: string) {
    if (!value) return null;
    if (value.startsWith('/api/uploads/notices/')) return value;
    try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.toString() : null; }
    catch { throw new BadRequestException('Notice attachment URL is invalid'); }
  }

  async uploadAttachment(file: { buffer: Buffer; mimetype: string; originalname: string; size: number }) {
    if (!file || file.size > 15 * 1024 * 1024) throw new BadRequestException('Choose an attachment smaller than 15 MB.');
    const ext = extname(file.originalname).toLowerCase();
    const valid = (file.mimetype === 'application/pdf' && ext === '.pdf' && file.buffer.subarray(0, 4).toString() === '%PDF')
      || (['text/csv', 'application/csv'].includes(file.mimetype) && ext === '.csv' && !file.buffer.includes(0))
      || (['application/json', 'application/geo+json'].includes(file.mimetype) && ['.json', '.geojson'].includes(ext) && this.validJson(file.buffer))
      || (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && ext === '.xlsx' && file.buffer.subarray(0, 2).toString() === 'PK');
    if (!valid) throw new BadRequestException('Upload a valid PDF, CSV, JSON, GeoJSON, or XLSX document.');
    const filename = `${randomUUID()}${ext}`;
    const directory = uploadDirectory('notices');
    await mkdir(directory, { recursive: true });
    await writeFile(join(directory, filename), file.buffer, { flag: 'wx' });
    return { attachmentUrl: `/api/uploads/notices/${filename}` };
  }

  private validJson(buffer: Buffer) { try { JSON.parse(buffer.toString('utf8')); return true; } catch { return false; } }

  private toRecord(notice: { id: string; titleNp: string | null; titleEn: string | null; summary: string; imageUrl: string | null; attachmentUrl: string | null; status: string; publishedAt: Date | null; updatedAt: Date; createdAt: Date }): NoticeRecord {
    return {
      id: notice.id,
      title: notice.titleEn ?? notice.titleNp ?? '',
      summary: notice.summary,
      imageUrl: notice.imageUrl ?? undefined,
      attachmentUrl: notice.attachmentUrl ?? undefined,
      published: notice.status === PublicationStatus.PUBLISHED,
      updatedAt: (notice.publishedAt ?? notice.updatedAt ?? notice.createdAt).toISOString(),
    };
  }
}
