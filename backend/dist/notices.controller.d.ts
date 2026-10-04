import { NoticesService, NoticeRecord } from './notices.service';
export declare class NoticesController {
    private readonly notices;
    constructor(notices: NoticesService);
    list(): Promise<NoticeRecord[]>;
    create(body: Omit<NoticeRecord, 'id' | 'updatedAt'>): Promise<NoticeRecord>;
    update(id: string, body: Partial<Omit<NoticeRecord, 'id' | 'updatedAt'>>): Promise<NoticeRecord>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
}
