export type ParsedGalleryItem = {
    title?: string;
    caption?: string;
    imageUrl: string;
    sourceUrl: string;
    publishedAt?: string;
    credit?: string;
};
export declare function parseGallery(_html: string): ParsedGalleryItem[];
