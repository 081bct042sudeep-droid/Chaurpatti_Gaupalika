export type ParsedStaff = {
    nameNp?: string;
    nameEn?: string;
    designation?: string;
    branch?: string;
    email?: string;
    phone?: string;
};
export declare function parseStaff(_html: string): ParsedStaff[];
