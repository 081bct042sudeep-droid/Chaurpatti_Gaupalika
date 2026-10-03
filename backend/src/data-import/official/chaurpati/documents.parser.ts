export type ParsedDocument = { titleNp?: string; titleEn?: string; category: string; documentUrl: string; sourceUrl: string; publishedAt?: string };

export function parseDocuments(_html: string): ParsedDocument[] {
  return [];
}
