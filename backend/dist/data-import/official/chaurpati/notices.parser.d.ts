export type ParsedNotice = {
    titleNp?: string;
    titleEn?: string;
    category?: string;
    publishedAt?: string;
    detailUrl: string;
    attachmentUrl?: string;
};
export declare function parseNotices(_html: string): ParsedNotice[];
