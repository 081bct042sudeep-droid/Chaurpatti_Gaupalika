import { AppealStatus, AppealType, Prisma } from '@prisma/client';
import { PrismaService } from './prisma.service';
export declare class AppealsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
    listPublic(query: {
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
            latitude: Prisma.Decimal | null;
            longitude: Prisma.Decimal | null;
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
    findPublic(id: string): Promise<{
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
        latitude: Prisma.Decimal | null;
        longitude: Prisma.Decimal | null;
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
    create(input: {
        type: AppealType;
        title: string;
        description: string;
        wardId?: string;
        categoryId: string;
        latitude?: number;
        longitude?: number;
        imageUrl?: string;
        authorName?: string;
        contact?: string;
        isAnonymous?: boolean;
    }): Promise<{
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
        latitude: Prisma.Decimal | null;
        longitude: Prisma.Decimal | null;
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
    toggleVote(id: string, userId: string): Promise<{
        voted: boolean;
    }>;
    comment(id: string, content: string, userId?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.CommentStatus;
        appealId: string;
        userId: string | null;
        parentId: string | null;
        content: string;
    }>;
    report(id: string, reason: string, description?: string, reportedBy?: string): Promise<{
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
        latitude: Prisma.Decimal | null;
        longitude: Prisma.Decimal | null;
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
    changeStatus(id: string, status: AppealStatus, note?: string, createdBy?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        referenceId: string;
        type: import(".prisma/client").$Enums.AppealType;
        title: string;
        description: string;
        wardId: string | null;
        categoryId: string;
        latitude: Prisma.Decimal | null;
        longitude: Prisma.Decimal | null;
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
    response(id: string, response: string, respondedBy?: string): Promise<{
        id: string;
        createdAt: Date;
        appealId: string;
        response: string;
        respondedBy: string | null;
    }>;
    resolve(id: string, note: string, createdBy?: string): Promise<{
        resolved: boolean;
    }>;
}
