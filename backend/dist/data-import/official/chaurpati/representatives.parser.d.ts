export type ParsedRepresentative = {
    nameNp?: string;
    nameEn?: string;
    position?: string;
    photoUrl?: string;
};
export declare function parseRepresentatives(_html: string): ParsedRepresentative[];
