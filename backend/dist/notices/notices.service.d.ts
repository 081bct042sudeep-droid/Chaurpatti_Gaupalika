export type PortalNotice = {
    id: string;
    title: string;
    summary: string;
    imageUrl?: string;
    published: boolean;
    updatedAt: string;
};
export declare class NoticesService {
    private notices;
    list(): PortalNotice[];
    create(input: Omit<PortalNotice, 'id' | 'updatedAt'>): PortalNotice;
    update(id: string, input: Partial<Omit<PortalNotice, 'id'>>): PortalNotice | null;
    remove(id: string): {
        success: boolean;
    };
}
