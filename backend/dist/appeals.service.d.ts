import { AppealStatus, AppealType, CommentStatus, ReportStatus } from './appeal-enums';
import { Prisma } from '@prisma/client';
import { PrismaService } from './prisma.service';
export declare class AppealsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
    adminCategories(): Prisma.PrismaPromise<{
        id: string;
        updatedAt: Date;
        createdAt: Date;
        nameNp: string;
        nameEn: string;
        slug: string;
        icon: string | null;
        isActive: boolean;
    }[]>;
    listPublic(query: {
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
    findPublic(id: string): Promise<Omit<{
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
    create(input: {
        type: AppealType;
        title: string;
        description: string;
        wardId: string;
        categoryId: string;
        latitude?: number;
        longitude?: number;
        imageUrl?: string;
        authorName?: string;
        contact?: string;
        isAnonymous?: boolean;
    }, authorTokenHash: string): Promise<Omit<{
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
    listMine(authorTokenHash: string): Promise<{
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
    toggleVote(id: string, userId: string): Promise<{
        voted: boolean;
        supportCount: number;
    }>;
    voteStatus(id: string, userId: string): Promise<{
        voted: boolean;
    }>;
    comment(id: string, content: string, userId: string, parentId?: string): Promise<{
        id: string;
        updatedAt: Date;
        status: string;
        createdAt: Date;
        appealId: string;
        userId: string | null;
        parentId: string | null;
        content: string;
    }>;
    report(id: string, reason: string, description?: string, reportedBy?: string, commentId?: string): Promise<{
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
    adminList(status?: AppealStatus): Prisma.PrismaPromise<({
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
    changeStatus(id: string, status: AppealStatus, note?: string, createdBy?: string): Promise<{
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
    edit(id: string, input: {
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
    response(id: string, response: string, respondedBy?: string): Promise<{
        id: string;
        createdAt: Date;
        appealId: string;
        response: string;
        respondedBy: string | null;
    }>;
    resolve(id: string, note: string, mediaUrl?: string): Promise<{
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
    adminReports(): Promise<({
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
    saveCategory(input: {
        id?: string;
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
    removeCategory(id: string): Promise<{
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
        byStatus: (Prisma.PickEnumerable<Prisma.PublicAppealGroupByOutputType, "status"[]> & {
            _count: {
                _all: number;
            };
        })[];
        byWard: (Prisma.PickEnumerable<Prisma.PublicAppealGroupByOutputType, "wardId"[]> & {
            _count: {
                _all: number;
            };
        })[];
        byCategory: (Prisma.PickEnumerable<Prisma.PublicAppealGroupByOutputType, "categoryId"[]> & {
            _count: {
                _all: number;
            };
        })[];
        byDay: {
            month: string;
            count: number;
        }[];
    }>;
    similar(title: string, description: string, wardId?: string): Promise<(Omit<{
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
    private publicAppeal;
}
