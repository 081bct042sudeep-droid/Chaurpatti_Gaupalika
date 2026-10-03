import { NoticesService, PortalNotice } from './notices.service';
export declare class NoticesController {
    private readonly notices;
    constructor(notices: NoticesService);
    list(): PortalNotice[];
    create(input: Omit<PortalNotice, 'id' | 'updatedAt'>): PortalNotice;
    update(id: string, input: Partial<Omit<PortalNotice, 'id'>>): PortalNotice | null;
    remove(id: string): {
        success: boolean;
    };
}
