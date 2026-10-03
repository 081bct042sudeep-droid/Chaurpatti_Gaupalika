import { OfficialDataImportService } from './official-data-import.service';
export declare class OfficialDataImportController {
    private readonly imports;
    constructor(imports: OfficialDataImportService);
    getDashboard(): {
        sourceName: string;
        sourceUrl: string;
        status: import("./official-data-import.service").SyncStatus;
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
    getLatest(): Record<string, unknown>;
    fetchLatest(): Promise<Record<string, unknown>>;
}
