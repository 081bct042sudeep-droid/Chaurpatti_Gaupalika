import { NoticesService, NoticeRecord } from './notices.service';
export declare class NoticesController {
    private readonly notices;
    constructor(notices: NoticesService);
    list(): NoticeRecord[];
    create(body: Omit<NoticeRecord, 'id' | 'updatedAt'>): NoticeRecord;
    update(id: string, body: Partial<Omit<NoticeRecord, 'id' | 'updatedAt'>>): NoticeRecord;
    remove(id: string): {
        deleted: boolean;
    };
}
