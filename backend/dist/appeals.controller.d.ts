import { AppealStatus, AppealType } from '@prisma/client';
import { AppealsService } from './appeals.service';
export declare class AppealsController {
    private readonly appeals;
    constructor(appeals: AppealsService);
    categories(): Promise<{
        id: string;
        nameNp: string;
        nameEn: string;
        slug: string;
        icon: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    list(query: {
        page?: number;
        limit?: number;
        wardId?: string;
        categoryId?: string;
        status?: AppealStatus;
        type?: AppealType;
        sort?: string;
    }): Promise<{
        items: ({
            category: {
                id: string;
                nameNp: string;
                nameEn: string;
                slug: string;
                icon: string | null;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            referenceId: string;
            type: import(".prisma/client").$Enums.AppealType;
            title: string;
            description: string;
            wardId: string | null;
            categoryId: string;
            latitude: import("@prisma/client/runtime/library").Decimal | null;
            longitude: import("@prisma/client/runtime/library").Decimal | null;
            imageUrl: string | null;
            status: import(".prisma/client").$Enums.AppealStatus;
            authorId: string | null;
            authorName: string | null;
            contact: string | null;
            isAnonymous: boolean;
            supportCount: number;
            commentCount: number;
            publishedAt: Date | null;
            resolvedAt: Date | null;
        })[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
    detail(id: string): Promise<{
        category: {
            id: string;
            nameNp: string;
            nameEn: string;
            slug: string;
            icon: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        comments: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.CommentStatus;
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
            createdAt: Date;
            status: import(".prisma/client").$Enums.AppealStatus;
            appealId: string;
            note: string | null;
            createdBy: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        referenceId: string;
        type: import(".prisma/client").$Enums.AppealType;
        title: string;
        description: string;
        wardId: string | null;
        categoryId: string;
        latitude: import("@prisma/client/runtime/library").Decimal | null;
        longitude: import("@prisma/client/runtime/library").Decimal | null;
        imageUrl: string | null;
        status: import(".prisma/client").$Enums.AppealStatus;
        authorId: string | null;
        authorName: string | null;
        contact: string | null;
        isAnonymous: boolean;
        supportCount: number;
        commentCount: number;
        publishedAt: Date | null;
        resolvedAt: Date | null;
    }>;
    create(body: Parameters<AppealsService['create']>[0]): Promise<{
        category: {
            id: string;
            nameNp: string;
            nameEn: string;
            slug: string;
            icon: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        referenceId: string;
        type: import(".prisma/client").$Enums.AppealType;
        title: string;
        description: string;
        wardId: string | null;
        categoryId: string;
        latitude: import("@prisma/client/runtime/library").Decimal | null;
        longitude: import("@prisma/client/runtime/library").Decimal | null;
        imageUrl: string | null;
        status: import(".prisma/client").$Enums.AppealStatus;
        authorId: string | null;
        authorName: string | null;
        contact: string | null;
        isAnonymous: boolean;
        supportCount: number;
        commentCount: number;
        publishedAt: Date | null;
        resolvedAt: Date | null;
    }>;
    vote(id: string, visitorId: string): Promise<{
        voted: boolean;
    }>;
    voteAgain(id: string, visitorId: string): Promise<{
        voted: boolean;
    }>;
    comments(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.CommentStatus;
        appealId: string;
        userId: string | null;
        parentId: string | null;
        content: string;
    }[]>;
    comment(id: string, content: string, visitorId?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.CommentStatus;
        appealId: string;
        userId: string | null;
        parentId: string | null;
        content: string;
    }>;
    report(id: string, body: {
        reason: string;
        description?: string;
    }, visitorId?: string): Promise<{
        id: string;
        createdAt: Date;
        description: string | null;
        status: import(".prisma/client").$Enums.ReportStatus;
        resolvedAt: Date | null;
        appealId: string;
        commentId: string | null;
        reportedBy: string | null;
        reason: string;
    }>;
    adminList(status?: AppealStatus): Promise<({
        category: {
            id: string;
            nameNp: string;
            nameEn: string;
            slug: string;
            icon: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        comments: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.CommentStatus;
            appealId: string;
            userId: string | null;
            parentId: string | null;
            content: string;
        }[];
        history: {
            id: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.AppealStatus;
            appealId: string;
            note: string | null;
            createdBy: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        referenceId: string;
        type: import(".prisma/client").$Enums.AppealType;
        title: string;
        description: string;
        wardId: string | null;
        categoryId: string;
        latitude: import("@prisma/client/runtime/library").Decimal | null;
        longitude: import("@prisma/client/runtime/library").Decimal | null;
        imageUrl: string | null;
        status: import(".prisma/client").$Enums.AppealStatus;
        authorId: string | null;
        authorName: string | null;
        contact: string | null;
        isAnonymous: boolean;
        supportCount: number;
        commentCount: number;
        publishedAt: Date | null;
        resolvedAt: Date | null;
    })[]>;
    status(id: string, body: {
        status: AppealStatus;
        note?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        referenceId: string;
        type: import(".prisma/client").$Enums.AppealType;
        title: string;
        description: string;
        wardId: string | null;
        categoryId: string;
        latitude: import("@prisma/client/runtime/library").Decimal | null;
        longitude: import("@prisma/client/runtime/library").Decimal | null;
        imageUrl: string | null;
        status: import(".prisma/client").$Enums.AppealStatus;
        authorId: string | null;
        authorName: string | null;
        contact: string | null;
        isAnonymous: boolean;
        supportCount: number;
        commentCount: number;
        publishedAt: Date | null;
        resolvedAt: Date | null;
    }>;
    response(id: string, response: string): Promise<{
        id: string;
        createdAt: Date;
        appealId: string;
        response: string;
        respondedBy: string | null;
    }>;
    resolve(id: string, note: string): Promise<{
        resolved: boolean;
    }>;
}
