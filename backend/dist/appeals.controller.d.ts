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
        updatedAt: Date;
        createdAt: Date;
        nameNp: string;
        nameEn: string;
        slug: string;
        icon: string | null;
        isActive: boolean;
    }[]>;
    mine(token?: string): Promise<{
        latestUpdate: {
            id: string;
            status: string;
            createdAt: Date;
            appealId: string;
            note: string | null;
            createdBy: string | null;
        };
        category: {
            id: string;
            updatedAt: Date;
            createdAt: Date;
            nameNp: string;
            nameEn: string;
            slug: string;
            icon: string | null;
            isActive: boolean;
        };
        id: string;
        updatedAt: Date;
        title: string;
        imageUrl: string | null;
        publishedAt: Date | null;
        status: string;
        createdAt: Date;
        referenceId: string;
        type: string;
        description: string;
        wardId: string | null;
        categoryId: string;
        latitude: number | null;
        longitude: number | null;
        authorName: string | null;
        isAnonymous: boolean;
        supportCount: number;
        commentCount: number;
        resolvedAt: Date | null;
        resolutionNote: string | null;
        resolutionMediaUrl: string | null;
    }[]>;
    similar(title?: string, description?: string, wardId?: string): Promise<(Omit<{
        category: {
            id: string;
            updatedAt: Date;
            createdAt: Date;
            nameNp: string;
            nameEn: string;
            slug: string;
            icon: string | null;
            isActive: boolean;
        };
    } & {
        id: string;
        updatedAt: Date;
        title: string;
        imageUrl: string | null;
        publishedAt: Date | null;
        status: string;
        createdAt: Date;
        referenceId: string;
        type: string;
        description: string;
        wardId: string | null;
        categoryId: string;
        latitude: number | null;
        longitude: number | null;
        authorId: string | null;
        authorName: string | null;
        contact: string | null;
        isAnonymous: boolean;
        supportCount: number;
        commentCount: number;
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
                updatedAt: Date;
                createdAt: Date;
                nameNp: string;
                nameEn: string;
                slug: string;
                icon: string | null;
                isActive: boolean;
            };
        } & {
            id: string;
            updatedAt: Date;
            title: string;
            imageUrl: string | null;
            publishedAt: Date | null;
            status: string;
            createdAt: Date;
            referenceId: string;
            type: string;
            description: string;
            wardId: string | null;
            categoryId: string;
            latitude: number | null;
            longitude: number | null;
            authorId: string | null;
            authorName: string | null;
            contact: string | null;
            isAnonymous: boolean;
            supportCount: number;
            commentCount: number;
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
            updatedAt: Date;
            createdAt: Date;
            nameNp: string;
            nameEn: string;
            slug: string;
            icon: string | null;
            isActive: boolean;
        };
        comments: {
            id: string;
            updatedAt: Date;
            status: string;
            createdAt: Date;
            appealId: string;
            userId: string | null;
            parentId: string | null;
            content: string;
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
            status: string;
            createdAt: Date;
            appealId: string;
            note: string | null;
            createdBy: string | null;
        }[];
    } & {
        id: string;
        updatedAt: Date;
        title: string;
        imageUrl: string | null;
        publishedAt: Date | null;
        status: string;
        createdAt: Date;
        referenceId: string;
        type: string;
        description: string;
        wardId: string | null;
        categoryId: string;
        latitude: number | null;
        longitude: number | null;
        authorId: string | null;
        authorName: string | null;
        contact: string | null;
        isAnonymous: boolean;
        supportCount: number;
        commentCount: number;
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
            updatedAt: Date;
            createdAt: Date;
            nameNp: string;
            nameEn: string;
            slug: string;
            icon: string | null;
            isActive: boolean;
        };
    } & {
        id: string;
        updatedAt: Date;
        title: string;
        imageUrl: string | null;
        publishedAt: Date | null;
        status: string;
        createdAt: Date;
        referenceId: string;
        type: string;
        description: string;
        wardId: string | null;
        categoryId: string;
        latitude: number | null;
        longitude: number | null;
        authorId: string | null;
        authorName: string | null;
        contact: string | null;
        isAnonymous: boolean;
        supportCount: number;
        commentCount: number;
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
        updatedAt: Date;
        status: string;
        createdAt: Date;
        appealId: string;
        userId: string | null;
        parentId: string | null;
        content: string;
    }[]>;
    comment(id: string, body: {
        content: string;
        parentId?: string;
    }, token?: string): Promise<{
        id: string;
        updatedAt: Date;
        status: string;
        createdAt: Date;
        appealId: string;
        userId: string | null;
        parentId: string | null;
        content: string;
    }>;
    report(id: string, body: {
        reason: string;
        description?: string;
        commentId?: string;
    }, token?: string): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        description: string | null;
        resolvedAt: Date | null;
        appealId: string;
        reportedBy: string | null;
        reason: string;
        commentId: string | null;
    }>;
    adminList(status?: AppealStatus): import(".prisma/client").Prisma.PrismaPromise<({
        category: {
            id: string;
            updatedAt: Date;
            createdAt: Date;
            nameNp: string;
            nameEn: string;
            slug: string;
            icon: string | null;
            isActive: boolean;
        };
        comments: {
            id: string;
            updatedAt: Date;
            status: string;
            createdAt: Date;
            appealId: string;
            userId: string | null;
            parentId: string | null;
            content: string;
        }[];
        reports: {
            id: string;
            status: string;
            createdAt: Date;
            description: string | null;
            resolvedAt: Date | null;
            appealId: string;
            reportedBy: string | null;
            reason: string;
            commentId: string | null;
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
            status: string;
            createdAt: Date;
            appealId: string;
            note: string | null;
            createdBy: string | null;
        }[];
    } & {
        id: string;
        updatedAt: Date;
        title: string;
        imageUrl: string | null;
        publishedAt: Date | null;
        status: string;
        createdAt: Date;
        referenceId: string;
        type: string;
        description: string;
        wardId: string | null;
        categoryId: string;
        latitude: number | null;
        longitude: number | null;
        authorId: string | null;
        authorName: string | null;
        contact: string | null;
        isAnonymous: boolean;
        supportCount: number;
        commentCount: number;
        resolvedAt: Date | null;
        resolutionNote: string | null;
        resolutionMediaUrl: string | null;
    })[]>;
    adminDetail(id: string): Promise<{
        category: {
            id: string;
            updatedAt: Date;
            createdAt: Date;
            nameNp: string;
            nameEn: string;
            slug: string;
            icon: string | null;
            isActive: boolean;
        };
        comments: {
            id: string;
            updatedAt: Date;
            status: string;
            createdAt: Date;
            appealId: string;
            userId: string | null;
            parentId: string | null;
            content: string;
        }[];
        reports: {
            id: string;
            status: string;
            createdAt: Date;
            description: string | null;
            resolvedAt: Date | null;
            appealId: string;
            reportedBy: string | null;
            reason: string;
            commentId: string | null;
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
            status: string;
            createdAt: Date;
            appealId: string;
            note: string | null;
            createdBy: string | null;
        }[];
    } & {
        id: string;
        updatedAt: Date;
        title: string;
        imageUrl: string | null;
        publishedAt: Date | null;
        status: string;
        createdAt: Date;
        referenceId: string;
        type: string;
        description: string;
        wardId: string | null;
        categoryId: string;
        latitude: number | null;
        longitude: number | null;
        authorId: string | null;
        authorName: string | null;
        contact: string | null;
        isAnonymous: boolean;
        supportCount: number;
        commentCount: number;
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
            updatedAt: Date;
            createdAt: Date;
            nameNp: string;
            nameEn: string;
            slug: string;
            icon: string | null;
            isActive: boolean;
        };
    } & {
        id: string;
        updatedAt: Date;
        title: string;
        imageUrl: string | null;
        publishedAt: Date | null;
        status: string;
        createdAt: Date;
        referenceId: string;
        type: string;
        description: string;
        wardId: string | null;
        categoryId: string;
        latitude: number | null;
        longitude: number | null;
        authorId: string | null;
        authorName: string | null;
        contact: string | null;
        isAnonymous: boolean;
        supportCount: number;
        commentCount: number;
        resolvedAt: Date | null;
        resolutionNote: string | null;
        resolutionMediaUrl: string | null;
    }>;
    status(id: string, body: {
        status: AppealStatus;
        note?: string;
    }): Promise<{
        id: string;
        updatedAt: Date;
        title: string;
        imageUrl: string | null;
        publishedAt: Date | null;
        status: string;
        createdAt: Date;
        referenceId: string;
        type: string;
        description: string;
        wardId: string | null;
        categoryId: string;
        latitude: number | null;
        longitude: number | null;
        authorId: string | null;
        authorName: string | null;
        contact: string | null;
        isAnonymous: boolean;
        supportCount: number;
        commentCount: number;
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
        updatedAt: Date;
        status: string;
        createdAt: Date;
        appealId: string;
        userId: string | null;
        parentId: string | null;
        content: string;
    }>;
    reports(): Promise<({
        appeal: {
            id: string;
            title: string;
            referenceId: string;
        };
        comment: {
            id: string;
            updatedAt: Date;
            status: string;
            createdAt: Date;
            appealId: string;
            userId: string | null;
            parentId: string | null;
            content: string;
        } | null;
    } & {
        id: string;
        status: string;
        createdAt: Date;
        description: string | null;
        resolvedAt: Date | null;
        appealId: string;
        reportedBy: string | null;
        reason: string;
        commentId: string | null;
    })[]>;
    moderateReport(id: string, status: ReportStatus): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        description: string | null;
        resolvedAt: Date | null;
        appealId: string;
        reportedBy: string | null;
        reason: string;
        commentId: string | null;
    }>;
    adminCategories(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        updatedAt: Date;
        createdAt: Date;
        nameNp: string;
        nameEn: string;
        slug: string;
        icon: string | null;
        isActive: boolean;
    }[]>;
    createCategory(body: {
        nameNp: string;
        nameEn: string;
        slug?: string;
        icon?: string;
    }): Promise<{
        id: string;
        updatedAt: Date;
        createdAt: Date;
        nameNp: string;
        nameEn: string;
        slug: string;
        icon: string | null;
        isActive: boolean;
    }>;
    updateCategory(id: string, body: {
        nameNp: string;
        nameEn: string;
        slug?: string;
        icon?: string;
        isActive?: boolean;
    }): Promise<{
        id: string;
        updatedAt: Date;
        createdAt: Date;
        nameNp: string;
        nameEn: string;
        slug: string;
        icon: string | null;
        isActive: boolean;
    }>;
    deleteCategory(id: string): Promise<{
        id: string;
        updatedAt: Date;
        createdAt: Date;
        nameNp: string;
        nameEn: string;
        slug: string;
        icon: string | null;
        isActive: boolean;
    }>;
    analytics(): Promise<{
        total: number;
        pending: number;
        inProgress: number;
        resolved: number;
        rejected: number;
        votes: number;
        comments: number;
        byStatus: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.PublicAppealGroupByOutputType, "status"[]> & {
            _count: {
                _all: number;
            };
        })[];
        byWard: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.PublicAppealGroupByOutputType, "wardId"[]> & {
            _count: {
                _all: number;
            };
        })[];
        byCategory: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.PublicAppealGroupByOutputType, "categoryId"[]> & {
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
