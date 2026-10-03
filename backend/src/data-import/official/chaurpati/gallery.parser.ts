export type ParsedGalleryItem = { title?: string; caption?: string; imageUrl: string; sourceUrl: string; publishedAt?: string; credit?: string };

export function parseGallery(_html: string): ParsedGalleryItem[] {
  return [];
}
