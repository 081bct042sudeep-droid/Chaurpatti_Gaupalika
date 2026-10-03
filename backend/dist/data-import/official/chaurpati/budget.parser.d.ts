export type ParsedBudget = {
    titleNp?: string;
    titleEn?: string;
    fiscalYear?: string;
    documentUrl: string;
    publishedAt?: string;
};
export declare function parseBudgets(_html: string): ParsedBudget[];
