import { AppealStatus, AppealType, CommentStatus, ReportStatus } from './appeal-enums';
import { Prisma } from '../node_modules/.prisma/portal-client';
import { PrismaService } from './prisma.service';
export declare class AppealsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
    adminCategories(): Prisma.PrismaPromise<{
        id: string;
        slug: string;
        nameNp: string;
        nameEn: string;
        icon: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
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
    findPublic(id: string): Promise<Omit<{
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
    listMine(authorTokenHash: string): Promise<{
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
    toggleVote(id: string, userId: string): Promise<{
        voted: boolean;
        supportCount: number;
    }>;
    voteStatus(id: string, userId: string): Promise<{
        voted: boolean;
    }>;
    comment(id: string, content: string, userId: string, parentId?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        content: string;
        appealId: string;
        userId: string | null;
        parentId: string | null;
    }>;
    report(id: string, reason: string, description?: string, reportedBy?: string, commentId?: string): Promise<{
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
    adminList(status?: AppealStatus): Prisma.PrismaPromise<({
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
    changeStatus(id: string, status: AppealStatus, note?: string, createdBy?: string): Promise<{
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
    edit(id: string, input: {
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
        createdAt: Date;
        updatedAt: Date;
        status: string;
        content: string;
        appealId: string;
        userId: string | null;
        parentId: string | null;
    }>;
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
    adminReports(): Promise<({
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
    saveCategory(input: {
        id?: string;
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
    removeCategory(id: string): Promise<{
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
    private publicAppeal;
}
