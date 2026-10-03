import { Injectable } from '@nestjs/common';
import { ChaurpatiSourceService } from './official/chaurpati/chaurpati-source.service';

export type SyncStatus = 'READY' | 'FETCHING' | 'REVIEW_REQUIRED' | 'FAILED';

@Injectable()
export class OfficialDataImportService {
  private status: SyncStatus = 'READY';
  private lastBatch: Record<string, unknown> | null = null;

  constructor(private readonly source: ChaurpatiSourceService) {}

  getDashboard() {
    return {
      sourceName: 'Chaurpati Rural Municipality',
      sourceUrl: this.source.baseUrl,
      status: this.status,
      lastSuccessfulSync: null,
      recordsFetched: 0,
      newRecords: 0,
      updatedRecords: 0,
      removedRecords: 0,
      conflicts: 0,
      failedRecords: 0,
      pendingApproval: 0,
      policy: 'Imported records never overwrite manually edited records automatically.',
    };
  }

  async fetchLatest() {
    this.status = 'FETCHING';
    const batch = await this.source.fetchPublicIndex();
    this.lastBatch = {
      id: `batch-${Date.now()}`,
      fetchedAt: new Date().toISOString(),
      sourceUrl: this.source.baseUrl,
      records: batch,
      verificationStatus: 'PENDING_REVIEW',
    };
    this.status = 'REVIEW_REQUIRED';
    return this.lastBatch;
  }

  getLastBatch() {
    return this.lastBatch ?? { message: 'No import batch has been fetched yet.' };
  }
}
