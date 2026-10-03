import { Injectable, ServiceUnavailableException } from '@nestjs/common';

@Injectable()
export class ChaurpatiSourceService {
  readonly baseUrl = 'https://chaurpatimun.gov.np/';

  async fetchPublicIndex() {
    try {
      const response = await fetch(this.baseUrl, { signal: AbortSignal.timeout(15_000) });
      if (!response.ok) {
        throw new Error(`Official source returned ${response.status}`);
      }
      const html = await response.text();
      return {
        sourceType: 'OFFICIAL_MUNICIPALITY_WEBSITE',
        sourceName: 'Chaurpati Rural Municipality',
        sourceUrl: this.baseUrl,
        sourceRecordId: 'homepage',
        sourcePublishedAt: null,
        lastFetchedAt: new Date().toISOString(),
        verificationStatus: 'PENDING_REVIEW',
        manuallyEdited: false,
        title: this.extractTitle(html),
        rawLength: html.length,
      };
    } catch {
      throw new ServiceUnavailableException('The official website is temporarily unavailable. No data was imported.');
    }
  }

  private extractTitle(html: string) {
    const match = html.match(/<title[^>]*>(.*?)<\/title>/is);
    return match?.[1]?.replace(/\s+/g, ' ').trim() ?? null;
  }
}
