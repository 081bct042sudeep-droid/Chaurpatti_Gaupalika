import { AppealStatus, AppealType, CommentStatus, ReportStatus } from './appeal-enums';
import { AppealsService } from './appeals.service';
import { AppealsSecurityService } from './appeals-security';
type UploadedImage = {
    buffer: Buffer;
    mimetype: string;
    size: number;
};
export declare class AppealsController {
    private readonly appeals;
    private readonly security;
    constructor(appeals: AppealsService, security: AppealsSecurityService);
    visitorToken(): {
        token: string;
    };
    categories(): Promise<{
        id: string;
        slug: string;
        nameNp: string;
        nameEn: string;
        icon: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    mine(token?: string): Promise<{
        latestUpdate: {
            id: string;
            createdAt: Date;
            status: string;
            appealId: string;
            note: string | null;
            createdBy: string | null;
        };
        category: {
            id: string;
            slug: string;
            nameNp: string;
            nameEn: string;
            icon: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        id: string;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string;
        latitude: number | null;
        longitude: number | null;
        imageUrl: string | null;
        status: string;
        description: string;
        referenceId: string;
        type: string;
        title: string;
        wardId: string | null;
        authorName: string | null;
        isAnonymous: boolean;
        supportCount: number;
        commentCount: number;
        publishedAt: Date | null;
        resolvedAt: Date | null;
        resolutionNote: string | null;
        resolutionMediaUrl: string | null;
    }[]>;
    similar(title?: string, description?: string, wardId?: string): Promise<(Omit<{
        category: {
            id: string;
            slug: string;
            nameNp: string;
            nameEn: string;
            icon: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string;
        latitude: number | null;
        longitude: number | null;
        imageUrl: string | null;
        status: string;
        description: string;
        referenceId: string;
        type: string;
        title: string;
        wardId: string | null;
        authorId: string | null;
        authorName: string | null;
        contact: string | null;
        isAnonymous: boolean;
        supportCount: number;
        commentCount: number;
        publishedAt: Date | null;
        resolvedAt: Date | null;
        resolutionNote: string | null;
        resolutionMediaUrl: string | null;
    }, "latitude" | "longitude" | "authorId" | "authorName" | "contact"> & {
        authorName: string | null;
        latitude?: number | null;
        longitude?: number | null;
    })[]>;
    list(query: {
        page?: number;
        limit?: number;
        wardId?: string;
        categoryId?: string;
        status?: AppealStatus;
        type?: AppealType;
        sort?: string;
        search?: string;
    }): Promise<{
        items: (Omit<{
            category: {
                id: string;
                slug: string;
                nameNp: string;
                nameEn: string;
                icon: string | null;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            categoryId: string;
            latitude: number | null;
            longitude: number | null;
            imageUrl: string | null;
            status: string;
            description: string;
            referenceId: string;
            type: string;
            title: string;
            wardId: string | null;
            authorId: string | null;
            authorName: string | null;
            contact: string | null;
            isAnonymous: boolean;
            supportCount: number;
            commentCount: number;
            publishedAt: Date | null;
            resolvedAt: Date | null;
            resolutionNote: string | null;
            resolutionMediaUrl: string | null;
        }, "latitude" | "longitude" | "authorId" | "authorName" | "contact"> & {
            authorName: string | null;
            latitude?: number | null;
            longitude?: number | null;
        })[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
    detail(id: string): Promise<Omit<{
        category: {
            id: string;
            slug: string;
            nameNp: string;
            nameEn: string;
            icon: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        comments: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            content: string;
            appealId: string;
            userId: string | null;
            parentId: string | null;
        }[];
        responses: {
            id: string;
            createdAt: Date;
            appealId: string;
            response: string;
            respondedBy: string | null;
        }[];
        history: {
            id: string;
            createdAt: Date;
            status: string;
            appealId: string;
            note: string | null;
            createdBy: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string;
        latitude: number | null;
        longitude: number | null;
        imageUrl: string | null;
        status: string;
        description: string;
        referenceId: string;
        type: string;
        title: string;
        wardId: string | null;
        authorId: string | null;
        authorName: string | null;
        contact: string | null;
        isAnonymous: boolean;
        supportCount: number;
        commentCount: number;
        publishedAt: Date | null;
        resolvedAt: Date | null;
        resolutionNote: string | null;
        resolutionMediaUrl: string | null;
    }, "latitude" | "longitude" | "authorId" | "authorName" | "contact"> & {
        authorName: string | null;
        latitude?: number | null;
        longitude?: number | null;
    }>;
    voteStatus(id: string, token?: string): Promise<{
        voted: boolean;
    }>;
    create(body: Parameters<AppealsService['create']>[0], token?: string): Promise<Omit<{
        category: {
            id: string;
            slug: string;
            nameNp: string;
            nameEn: string;
            icon: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string;
        latitude: number | null;
        longitude: number | null;
        imageUrl: string | null;
        status: string;
        description: string;
        referenceId: string;
        type: string;
        title: string;
        wardId: string | null;
        authorId: string | null;
        authorName: string | null;
        contact: string | null;
        isAnonymous: boolean;
        supportCount: number;
        commentCount: number;
        publishedAt: Date | null;
        resolvedAt: Date | null;
        resolutionNote: string | null;
        resolutionMediaUrl: string | null;
    }, "latitude" | "longitude" | "authorId" | "authorName" | "contact"> & {
        authorName: string | null;
        latitude?: number | null;
        longitude?: number | null;
    }>;
    upload(file: UploadedImage | undefined, token?: string): Promise<{
        url: string;
    }>;
    vote(id: string, token?: string): Promise<{
        voted: boolean;
        supportCount: number;
    }>;
    voteAgain(id: string, token?: string): Promise<{
        voted: boolean;
        supportCount: number;
    }>;
    comments(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        content: string;
        appealId: string;
        userId: string | null;
        parentId: string | null;
    }[]>;
    comment(id: string, body: {
        content: string;
        parentId?: string;
    }, token?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        content: string;
        appealId: string;
        userId: string | null;
        parentId: string | null;
    }>;
    report(id: string, body: {
        reason: string;
        description?: string;
        commentId?: string;
    }, token?: string): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        reason: string;
        description: string | null;
        resolvedAt: Date | null;
        appealId: string;
        reportedBy: string | null;
        commentId: string | null;
    }>;
    adminList(status?: AppealStatus): import(".prisma/portal-client").Prisma.PrismaPromise<({
        category: {
            id: string;
            slug: string;
            nameNp: string;
            nameEn: string;
            icon: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        reports: {
            id: string;
            createdAt: Date;
            status: string;
            reason: string;
            description: string | null;
            resolvedAt: Date | null;
            appealId: string;
            reportedBy: string | null;
            commentId: string | null;
        }[];
        comments: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            content: string;
            appealId: string;
            userId: string | null;
            parentId: string | null;
        }[];
        responses: {
            id: string;
            createdAt: Date;
            appealId: string;
            response: string;
            respondedBy: string | null;
        }[];
        history: {
            id: string;
            createdAt: Date;
            status: string;
            appealId: string;
            note: string | null;
            createdBy: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string;
        latitude: number | null;
        longitude: number | null;
        imageUrl: string | null;
        status: string;
        description: string;
        referenceId: string;
        type: string;
        title: string;
        wardId: string | null;
        authorId: string | null;
        authorName: string | null;
        contact: string | null;
        isAnonymous: boolean;
        supportCount: number;
        commentCount: number;
        publishedAt: Date | null;
        resolvedAt: Date | null;
        resolutionNote: string | null;
        resolutionMediaUrl: string | null;
    })[]>;
    adminDetail(id: string): Promise<{
        category: {
            id: string;
            slug: string;
            nameNp: string;
            nameEn: string;
            icon: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        reports: {
            id: string;
            createdAt: Date;
            status: string;
            reason: string;
            description: string | null;
            resolvedAt: Date | null;
            appealId: string;
            reportedBy: string | null;
            commentId: string | null;
        }[];
        comments: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            content: string;
            appealId: string;
            userId: string | null;
            parentId: string | null;
        }[];
        responses: {
            id: string;
            createdAt: Date;
            appealId: string;
            response: string;
            respondedBy: string | null;
        }[];
        history: {
            id: string;
            createdAt: Date;
            status: string;
            appealId: string;
            note: string | null;
            createdBy: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string;
        latitude: number | null;
        longitude: number | null;
        imageUrl: string | null;
        status: string;
        description: string;
        referenceId: string;
        type: string;
        title: string;
        wardId: string | null;
        authorId: string | null;
        authorName: string | null;
        contact: string | null;
        isAnonymous: boolean;
        supportCount: number;
        commentCount: number;
        publishedAt: Date | null;
        resolvedAt: Date | null;
        resolutionNote: string | null;
        resolutionMediaUrl: string | null;
    }>;
    deleteAppeal(id: string): Promise<{
        deleted: boolean;
    }>;
    edit(id: string, body: {
        title?: string;
        description?: string;
        wardId?: string;
        categoryId?: string;
        type?: AppealType;
    }): Promise<{
        category: {
            id: string;
            slug: string;
            nameNp: string;
            nameEn: string;
            icon: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string;
        latitude: number | null;
        longitude: number | null;
        imageUrl: string | null;
        status: string;
        description: string;
        referenceId: string;
        type: string;
        title: string;
        wardId: string | null;
        authorId: string | null;
        authorName: string | null;
        contact: string | null;
        isAnonymous: boolean;
        supportCount: number;
        commentCount: number;
        publishedAt: Date | null;
        resolvedAt: Date | null;
        resolutionNote: string | null;
        resolutionMediaUrl: string | null;
    }>;
    status(id: string, body: {
        status: AppealStatus;
        note?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string;
        latitude: number | null;
        longitude: number | null;
        imageUrl: string | null;
        status: string;
        description: string;
        referenceId: string;
        type: string;
        title: string;
        wardId: string | null;
        authorId: string | null;
        authorName: string | null;
        contact: string | null;
        isAnonymous: boolean;
        supportCount: number;
        commentCount: number;
        publishedAt: Date | null;
        resolvedAt: Date | null;
        resolutionNote: string | null;
        resolutionMediaUrl: string | null;
    }>;
    response(id: string, response: string): Promise<{
        id: string;
        createdAt: Date;
        appealId: string;
        response: string;
        respondedBy: string | null;
    }>;
    resolve(id: string, body: {
        note: string;
        mediaUrl?: string;
    }): Promise<{
        resolved: boolean;
    }>;
    moderateComment(id: string, status: CommentStatus): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        content: string;
        appealId: string;
        userId: string | null;
        parentId: string | null;
    }>;
    reports(): Promise<({
        appeal: {
            id: string;
            referenceId: string;
            title: string;
        };
        comment: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            content: string;
            appealId: string;
            userId: string | null;
            parentId: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        status: string;
        reason: string;
        description: string | null;
        resolvedAt: Date | null;
        appealId: string;
        reportedBy: string | null;
        commentId: string | null;
    })[]>;
    moderateReport(id: string, status: ReportStatus): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        reason: string;
        description: string | null;
        resolvedAt: Date | null;
        appealId: string;
        reportedBy: string | null;
        commentId: string | null;
    }>;
    adminCategories(): import(".prisma/portal-client").Prisma.PrismaPromise<{
        id: string;
        slug: string;
        nameNp: string;
        nameEn: string;
        icon: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    createCategory(body: {
        nameNp: string;
        nameEn: string;
        slug?: string;
        icon?: string;
    }): Promise<{
        id: string;
        slug: string;
        nameNp: string;
        nameEn: string;
        icon: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateCategory(id: string, body: {
        nameNp: string;
        nameEn: string;
        slug?: string;
        icon?: string;
        isActive?: boolean;
    }): Promise<{
        id: string;
        slug: string;
        nameNp: string;
        nameEn: string;
        icon: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteCategory(id: string): Promise<{
        id: string;
        slug: string;
        nameNp: string;
        nameEn: string;
        icon: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    analytics(): Promise<{
        total: number;
        pending: number;
        inProgress: number;
        resolved: number;
        rejected: number;
        votes: number;
        comments: number;
        byStatus: (import(".prisma/portal-client").Prisma.PickEnumerable<import(".prisma/portal-client").Prisma.PublicAppealGroupByOutputType, "status"[]> & {
            _count: {
                _all: number;
            };
        })[];
        byWard: (import(".prisma/portal-client").Prisma.PickEnumerable<import(".prisma/portal-client").Prisma.PublicAppealGroupByOutputType, "wardId"[]> & {
            _count: {
                _all: number;
            };
        })[];
        byCategory: (import(".prisma/portal-client").Prisma.PickEnumerable<import(".prisma/portal-client").Prisma.PublicAppealGroupByOutputType, "categoryId"[]> & {
            _count: {
                _all: number;
            };
        })[];
        byDay: {
            month: string;
            count: number;
        }[];
    }>;
}
export {};
