import { PrismaService } from './prisma.service';
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
export declare class NoticesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(): Promise<NoticeRecord[]>;
    create(input: NoticeInput): Promise<NoticeRecord>;
    update(id: string, input: Partial<NoticeInput>): Promise<NoticeRecord>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
    private imageValue;
    private attachmentValue;
    uploadAttachment(file: {
        buffer: Buffer;
        mimetype: string;
        originalname: string;
        size: number;
    }): Promise<{
        attachmentUrl: string;
    }>;
    private validJson;
    private toRecord;
}
export {};
