export type NoticeRecord = {
    id: string;
    title: string;
    summary: string;
    imageUrl?: string;
    published: boolean;
    updatedAt: string;
};
export declare class NoticesService {
    private notices;
    list(): NoticeRecord[];
    create(input: Omit<NoticeRecord, 'id' | 'updatedAt'>): NoticeRecord;
    update(id: string, input: Partial<Omit<NoticeRecord, 'id' | 'updatedAt'>>): NoticeRecord;
    remove(id: string): {
        deleted: boolean;
    };
}
