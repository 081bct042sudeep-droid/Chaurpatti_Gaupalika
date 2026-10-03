import { ChaurpatiSourceService } from './official/chaurpati/chaurpati-source.service';
export type SyncStatus = 'READY' | 'FETCHING' | 'REVIEW_REQUIRED' | 'FAILED';
export declare class OfficialDataImportService {
    private readonly source;
    private status;
    private lastBatch;
    constructor(source: ChaurpatiSourceService);
    getDashboard(): {
        sourceName: string;
        sourceUrl: string;
        status: SyncStatus;
        lastSuccessfulSync: null;
        recordsFetched: number;
        newRecords: number;
        updatedRecords: number;
        removedRecords: number;
        conflicts: number;
        failedRecords: number;
        pendingApproval: number;
        policy: string;
    };
    fetchLatest(): Promise<Record<string, unknown>>;
    getLastBatch(): Record<string, unknown>;
}
