export declare class ChaurpatiSourceService {
    readonly baseUrl = "https://chaurpatimun.gov.np/";
    fetchPublicIndex(): Promise<{
        sourceType: string;
        sourceName: string;
        sourceUrl: string;
        sourceRecordId: string;
        sourcePublishedAt: null;
        lastFetchedAt: string;
        verificationStatus: string;
        manuallyEdited: boolean;
        title: string | null;
        rawLength: number;
    }>;
    private extractTitle;
}
