import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { NoticesService } from './notices.service';

type DocumentInput = { title?: string; summary?: string; attachmentUrl?: string; sourceUrl?: string };

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService, private readonly notices: NoticesService) {}

  async listPublic() {
    const [documents, legacyAttachments] = await Promise.all([
      this.prisma.document.findMany({
        where: { verificationStatus: 'VERIFIED', publishedAt: { not: null } },
        select: { id: true, titleNp: true, titleEn: true, documentUrl: true, publishedAt: true, updatedAt: true, createdAt: true },
        orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      }),
      this.prisma.notice.findMany({
        where: { sourceMetadataId: null, status: 'PUBLISHED', attachmentUrl: { not: null } },
        select: { id: true, titleNp: true, titleEn: true, summary: true, attachmentUrl: true, publishedAt: true, updatedAt: true, createdAt: true },
        orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      }),
    ]);

    return [
      ...documents.map((document) => ({
        id: `document-${document.id}`,
        title: document.titleEn ?? document.titleNp ?? '',
        summary: '',
        attachmentUrl: document.documentUrl,
        updatedAt: (document.publishedAt ?? document.updatedAt ?? document.createdAt).toISOString(),
      })),
      ...legacyAttachments.map((notice) => ({
        id: `legacy-${notice.id}`,
        title: notice.titleEn ?? notice.titleNp ?? '',
        summary: notice.summary,
        attachmentUrl: notice.attachmentUrl!,
        updatedAt: (notice.publishedAt ?? notice.updatedAt ?? notice.createdAt).toISOString(),
      })),
    ].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  upload(file?: { buffer: Buffer; mimetype: string; originalname: string; size: number }) {
    if (!file) throw new BadRequestException('Choose a document to upload.');
    return this.notices.uploadAttachment(file);
  }

  async publish(input: DocumentInput) {
    const title = input.title?.trim();
    const attachmentUrl = input.attachmentUrl?.trim();
    if (!title) throw new BadRequestException('Document title is required.');
    if (!attachmentUrl) throw new BadRequestException('Upload a document before publishing.');
    if (!attachmentUrl.startsWith('/api/uploads/notices/') && !/^https?:\/\//i.test(attachmentUrl)) {
      throw new BadRequestException('Document URL is invalid.');
    }

    const document = await this.prisma.document.create({
      data: {
        titleEn: title.slice(0, 240),
        category: 'OFFICIAL_DOCUMENT',
        documentUrl: attachmentUrl,
        sourceUrl: input.sourceUrl?.trim() || attachmentUrl,
        publishedAt: new Date(),
        verificationStatus: 'VERIFIED',
      },
      select: { id: true, titleNp: true, titleEn: true, documentUrl: true, publishedAt: true, updatedAt: true, createdAt: true },
    });
    return {
      id: `document-${document.id}`,
      title: document.titleEn ?? document.titleNp ?? '',
      summary: input.summary?.trim() ?? '',
      attachmentUrl: document.documentUrl,
      updatedAt: (document.publishedAt ?? document.updatedAt ?? document.createdAt).toISOString(),
    };
  }
}
