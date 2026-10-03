-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('UNVERIFIED', 'PENDING_REVIEW', 'VERIFIED', 'CONFLICT', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PublicationStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AppealType" AS ENUM ('PROBLEM', 'SUGGESTION');

-- CreateEnum
CREATE TYPE "AppealStatus" AS ENUM ('PENDING', 'APPROVED', 'UNDER_REVIEW', 'FORWARDED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CommentStatus" AS ENUM ('VISIBLE', 'PENDING', 'HIDDEN', 'DELETED');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED');

-- CreateTable
CREATE TABLE "ImportBatch" (
    "id" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "importedAt" TIMESTAMP(3),
    "importingAdminId" TEXT,
    "recordsFetched" INTEGER NOT NULL DEFAULT 0,
    "newRecords" INTEGER NOT NULL DEFAULT 0,
    "updatedRecords" INTEGER NOT NULL DEFAULT 0,
    "conflicts" INTEGER NOT NULL DEFAULT 0,
    "failedRecords" INTEGER NOT NULL DEFAULT 0,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourceMetadata" (
    "id" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "sourceRecordId" TEXT,
    "sourcePublishedAt" TIMESTAMP(3),
    "lastFetchedAt" TIMESTAMP(3),
    "lastVerifiedAt" TIMESTAMP(3),
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "importBatchId" TEXT,
    "manuallyEdited" BOOLEAN NOT NULL DEFAULT false,
    "manualEditAt" TIMESTAMP(3),
    "manuallyEditedBy" TEXT,

    CONSTRAINT "SourceMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ward" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "nameNp" TEXT,
    "nameEn" TEXT,
    "office" TEXT,
    "contact" TEXT,
    "status" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "sourceMetadataId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Representative" (
    "id" TEXT NOT NULL,
    "nameNp" TEXT,
    "nameEn" TEXT,
    "position" TEXT NOT NULL,
    "wardNumber" INTEGER,
    "phone" TEXT,
    "email" TEXT,
    "photoUrl" TEXT,
    "status" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "sourceMetadataId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Representative_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notice" (
    "id" TEXT NOT NULL,
    "titleNp" TEXT,
    "titleEn" TEXT,
    "category" TEXT,
    "detailUrl" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "attachmentUrl" TEXT,
    "status" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "sourceMetadataId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "titleNp" TEXT,
    "titleEn" TEXT,
    "category" TEXT NOT NULL,
    "fiscalYear" TEXT,
    "documentUrl" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "userName" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "oldValue" JSONB,
    "newValue" JSONB,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppealCategory" (
    "id" TEXT NOT NULL,
    "nameNp" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppealCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicAppeal" (
    "id" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "type" "AppealType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "wardId" TEXT,
    "categoryId" TEXT NOT NULL,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "imageUrl" TEXT,
    "status" "AppealStatus" NOT NULL DEFAULT 'PENDING',
    "authorId" TEXT,
    "authorName" TEXT,
    "contact" TEXT,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT true,
    "supportCount" INTEGER NOT NULL DEFAULT 0,
    "commentCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "PublicAppeal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppealVote" (
    "id" TEXT NOT NULL,
    "appealId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppealVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppealComment" (
    "id" TEXT NOT NULL,
    "appealId" TEXT NOT NULL,
    "userId" TEXT,
    "parentId" TEXT,
    "content" TEXT NOT NULL,
    "status" "CommentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppealComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppealReport" (
    "id" TEXT NOT NULL,
    "appealId" TEXT NOT NULL,
    "commentId" TEXT,
    "reportedBy" TEXT,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "AppealReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppealResponse" (
    "id" TEXT NOT NULL,
    "appealId" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "respondedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppealResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppealStatusHistory" (
    "id" TEXT NOT NULL,
    "appealId" TEXT NOT NULL,
    "status" "AppealStatus" NOT NULL,
    "note" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppealStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ward_number_key" ON "Ward"("number");

-- CreateIndex
CREATE UNIQUE INDEX "Ward_sourceMetadataId_key" ON "Ward"("sourceMetadataId");

-- CreateIndex
CREATE UNIQUE INDEX "Representative_sourceMetadataId_key" ON "Representative"("sourceMetadataId");

-- CreateIndex
CREATE UNIQUE INDEX "Notice_sourceMetadataId_key" ON "Notice"("sourceMetadataId");

-- CreateIndex
CREATE UNIQUE INDEX "AppealCategory_slug_key" ON "AppealCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "PublicAppeal_referenceId_key" ON "PublicAppeal"("referenceId");

-- CreateIndex
CREATE INDEX "PublicAppeal_status_createdAt_idx" ON "PublicAppeal"("status", "createdAt");

-- CreateIndex
CREATE INDEX "PublicAppeal_categoryId_idx" ON "PublicAppeal"("categoryId");

-- CreateIndex
CREATE INDEX "PublicAppeal_wardId_idx" ON "PublicAppeal"("wardId");

-- CreateIndex
CREATE UNIQUE INDEX "AppealVote_appealId_userId_key" ON "AppealVote"("appealId", "userId");

-- CreateIndex
CREATE INDEX "AppealComment_appealId_status_idx" ON "AppealComment"("appealId", "status");

-- CreateIndex
CREATE INDEX "AppealStatusHistory_appealId_createdAt_idx" ON "AppealStatusHistory"("appealId", "createdAt");

-- AddForeignKey
ALTER TABLE "Ward" ADD CONSTRAINT "Ward_sourceMetadataId_fkey" FOREIGN KEY ("sourceMetadataId") REFERENCES "SourceMetadata"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Representative" ADD CONSTRAINT "Representative_sourceMetadataId_fkey" FOREIGN KEY ("sourceMetadataId") REFERENCES "SourceMetadata"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notice" ADD CONSTRAINT "Notice_sourceMetadataId_fkey" FOREIGN KEY ("sourceMetadataId") REFERENCES "SourceMetadata"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicAppeal" ADD CONSTRAINT "PublicAppeal_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "AppealCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppealVote" ADD CONSTRAINT "AppealVote_appealId_fkey" FOREIGN KEY ("appealId") REFERENCES "PublicAppeal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppealComment" ADD CONSTRAINT "AppealComment_appealId_fkey" FOREIGN KEY ("appealId") REFERENCES "PublicAppeal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppealReport" ADD CONSTRAINT "AppealReport_appealId_fkey" FOREIGN KEY ("appealId") REFERENCES "PublicAppeal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppealResponse" ADD CONSTRAINT "AppealResponse_appealId_fkey" FOREIGN KEY ("appealId") REFERENCES "PublicAppeal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppealStatusHistory" ADD CONSTRAINT "AppealStatusHistory_appealId_fkey" FOREIGN KEY ("appealId") REFERENCES "PublicAppeal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

