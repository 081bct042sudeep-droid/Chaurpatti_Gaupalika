export type ParsedWard = {
    number: number;
    nameNp?: string;
    nameEn?: string;
    office?: string;
    contact?: string;
};
export declare function parseWards(_html: string): ParsedWard[];
