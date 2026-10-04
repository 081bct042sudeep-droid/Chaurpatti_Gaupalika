-- CreateTable
CREATE TABLE "ImportBatch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceType" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "fetchedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "importedAt" DATETIME,
    "importingAdminId" TEXT,
    "recordsFetched" INTEGER NOT NULL DEFAULT 0,
    "newRecords" INTEGER NOT NULL DEFAULT 0,
    "updatedRecords" INTEGER NOT NULL DEFAULT 0,
    "conflicts" INTEGER NOT NULL DEFAULT 0,
    "failedRecords" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SourceMetadata" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceType" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "sourceRecordId" TEXT,
    "sourcePublishedAt" DATETIME,
    "lastFetchedAt" DATETIME,
    "lastVerifiedAt" DATETIME,
    "verificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED',
    "importBatchId" TEXT,
    "manuallyEdited" BOOLEAN NOT NULL DEFAULT false,
    "manualEditAt" DATETIME,
    "manuallyEditedBy" TEXT
);

-- CreateTable
CREATE TABLE "Ward" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" INTEGER NOT NULL,
    "nameNp" TEXT,
    "nameEn" TEXT,
    "office" TEXT,
    "contact" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "sourceMetadataId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Ward_sourceMetadataId_fkey" FOREIGN KEY ("sourceMetadataId") REFERENCES "SourceMetadata" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Representative" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nameNp" TEXT,
    "nameEn" TEXT,
    "position" TEXT NOT NULL,
    "wardNumber" INTEGER,
    "phone" TEXT,
    "email" TEXT,
    "photoUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "sourceMetadataId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Representative_sourceMetadataId_fkey" FOREIGN KEY ("sourceMetadataId") REFERENCES "SourceMetadata" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titleNp" TEXT,
    "titleEn" TEXT,
    "category" TEXT,
    "detailUrl" TEXT NOT NULL DEFAULT '/',
    "summary" TEXT NOT NULL DEFAULT '',
    "imageUrl" TEXT,
    "publishedAt" DATETIME,
    "attachmentUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "sourceMetadataId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Notice_sourceMetadataId_fkey" FOREIGN KEY ("sourceMetadataId") REFERENCES "SourceMetadata" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titleNp" TEXT,
    "titleEn" TEXT,
    "category" TEXT NOT NULL,
    "fiscalYear" TEXT,
    "documentUrl" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "publishedAt" DATETIME,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "userName" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "oldValue" JSONB,
    "newValue" JSONB,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AppealCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nameNp" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PublicAppeal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "referenceId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "wardId" TEXT,
    "categoryId" TEXT NOT NULL,
    "latitude" REAL,
    "longitude" REAL,
    "imageUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "authorId" TEXT,
    "authorName" TEXT,
    "contact" TEXT,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT true,
    "supportCount" INTEGER NOT NULL DEFAULT 0,
    "commentCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "publishedAt" DATETIME,
    "resolvedAt" DATETIME,
    "resolutionNote" TEXT,
    "resolutionMediaUrl" TEXT,
    CONSTRAINT "PublicAppeal_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "AppealCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AppealVote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "appealId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AppealVote_appealId_fkey" FOREIGN KEY ("appealId") REFERENCES "PublicAppeal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AppealComment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "appealId" TEXT NOT NULL,
    "userId" TEXT,
    "parentId" TEXT,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AppealComment_appealId_fkey" FOREIGN KEY ("appealId") REFERENCES "PublicAppeal" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AppealComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "AppealComment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AppealReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "appealId" TEXT NOT NULL,
    "commentId" TEXT,
    "reportedBy" TEXT,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" DATETIME,
    CONSTRAINT "AppealReport_appealId_fkey" FOREIGN KEY ("appealId") REFERENCES "PublicAppeal" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AppealReport_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "AppealComment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AppealResponse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "appealId" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "respondedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AppealResponse_appealId_fkey" FOREIGN KEY ("appealId") REFERENCES "PublicAppeal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AppealStatusHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "appealId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "note" TEXT,
    "createdBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AppealStatusHistory_appealId_fkey" FOREIGN KEY ("appealId") REFERENCES "PublicAppeal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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

