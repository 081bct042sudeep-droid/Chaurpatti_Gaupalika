-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

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
    "status" TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
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
    "verificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED',
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
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "sourceMetadataId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MapCategory" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameNp" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "icon" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isTourism" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MapCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MapPlace" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameNp" TEXT NOT NULL,
    "nameEn" TEXT,
    "descriptionNp" TEXT,
    "descriptionEn" TEXT,
    "categoryId" TEXT,
    "wardNumber" INTEGER,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "geometryType" TEXT NOT NULL DEFAULT 'POINT',
    "geometry" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "imageUrl" TEXT,
    "openingHours" TEXT,
    "isTourism" BOOLEAN NOT NULL DEFAULT false,
    "tourismStatus" TEXT NOT NULL DEFAULT 'DRAFT',
    "shortDescriptionNp" TEXT,
    "shortDescriptionEn" TEXT,
    "historyNp" TEXT,
    "historyEn" TEXT,
    "culturalSignificanceNp" TEXT,
    "culturalSignificanceEn" TEXT,
    "religiousSignificanceNp" TEXT,
    "religiousSignificanceEn" TEXT,
    "naturalFeaturesNp" TEXT,
    "naturalFeaturesEn" TEXT,
    "activitiesNp" TEXT,
    "activitiesEn" TEXT,
    "bestTimeNp" TEXT,
    "bestTimeEn" TEXT,
    "howToReachNp" TEXT,
    "howToReachEn" TEXT,
    "facilitiesNp" TEXT,
    "facilitiesEn" TEXT,
    "safetyInfoNp" TEXT,
    "safetyInfoEn" TEXT,
    "emergencyInfoNp" TEXT,
    "emergencyInfoEn" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "sourceName" TEXT,
    "sourceUrl" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MapPlace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TourismImage" (
    "id" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "captionNp" TEXT,
    "captionEn" TEXT,
    "altText" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TourismImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TourismRating" (
    "id" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "visitorHash" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TourismRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TourismReview" (
    "id" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "visitorHash" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TourismReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TourismReviewReport" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "visitorHash" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TourismReviewReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TourismVisit" (
    "id" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "visitorHash" TEXT NOT NULL,
    "dayBucket" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TourismVisit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TourismFavorite" (
    "id" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "visitorHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TourismFavorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MapBoundary" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "layerType" TEXT NOT NULL DEFAULT 'WARD_BOUNDARY',
    "wardNumber" INTEGER,
    "geoJson" TEXT NOT NULL,
    "sourceName" TEXT,
    "sourceUrl" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MapBoundary_pkey" PRIMARY KEY ("id")
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
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
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
    "detailUrl" TEXT NOT NULL DEFAULT '/',
    "summary" TEXT NOT NULL DEFAULT '',
    "imageUrl" TEXT,
    "publishedAt" TIMESTAMP(3),
    "attachmentUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
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
    "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
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
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "wardId" TEXT,
    "categoryId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "imageUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
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
    "resolutionNote" TEXT,
    "resolutionMediaUrl" TEXT,

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
    "status" TEXT NOT NULL DEFAULT 'PENDING',
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
    "status" TEXT NOT NULL DEFAULT 'PENDING',
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
    "status" TEXT NOT NULL,
    "note" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppealStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfficialService" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameNp" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "categoryNp" TEXT,
    "categoryEn" TEXT,
    "descriptionNp" TEXT,
    "descriptionEn" TEXT,
    "officialWebsiteUrl" TEXT,
    "officialApplicationUrl" TEXT,
    "officialFormUrl" TEXT,
    "officialSourceUrl" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "sourceDocumentName" TEXT,
    "verificationStatus" TEXT NOT NULL DEFAULT 'NEEDS_REVIEW',
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "notes" TEXT,
    "keywordsJson" TEXT NOT NULL DEFAULT '[]',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OfficialService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetSourceDocument" (
    "id" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fiscalYear" TEXT NOT NULL,
    "fileHash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEEDS_REVIEW',
    "sourceUpdatedAt" TIMESTAMP(3),
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalNpr" DOUBLE PRECISION,
    "extractedRows" INTEGER NOT NULL DEFAULT 0,
    "validRows" INTEGER NOT NULL DEFAULT 0,
    "warningsJson" TEXT NOT NULL DEFAULT '[]',
    "lastError" TEXT,

    CONSTRAINT "BudgetSourceDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetAllocation" (
    "id" TEXT NOT NULL,
    "sourceDocumentId" TEXT NOT NULL,
    "fiscalYear" TEXT NOT NULL,
    "wardNumber" INTEGER,
    "projectName" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "sectorKey" TEXT NOT NULL,
    "expenditureHead" TEXT,
    "budgetCode" TEXT,
    "amountNpr" DOUBLE PRECISION NOT NULL,
    "rawAmount" TEXT NOT NULL,
    "rawRow" TEXT NOT NULL,
    "rowNumber" INTEGER,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "BudgetAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegacyMunicipalServiceCategoryArchive" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameNp" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "icon" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegacyMunicipalServiceCategoryArchive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegacyMunicipalServiceArchive" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameNp" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "icon" TEXT,
    "categoryId" TEXT,
    "shortDescriptionNp" TEXT,
    "shortDescriptionEn" TEXT,
    "descriptionNp" TEXT,
    "descriptionEn" TEXT,
    "eligibilityNp" TEXT,
    "eligibilityEn" TEXT,
    "procedureNp" TEXT,
    "procedureEn" TEXT,
    "documentsJson" TEXT NOT NULL DEFAULT '[]',
    "applicationFieldsJson" TEXT NOT NULL DEFAULT '[]',
    "feeNp" TEXT,
    "feeEn" TEXT,
    "processingTimeNp" TEXT,
    "processingTimeEn" TEXT,
    "departmentNp" TEXT,
    "departmentEn" TEXT,
    "wardNumbersJson" TEXT NOT NULL DEFAULT '[]',
    "onlineEnabled" BOOLEAN NOT NULL DEFAULT false,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "noticeNp" TEXT,
    "noticeEn" TEXT,
    "formUrl" TEXT,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "LegacyMunicipalServiceArchive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegacyServiceApplicationArchive" (
    "id" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "accessTokenHash" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "applicantName" TEXT NOT NULL,
    "wardNumber" INTEGER,
    "phone" TEXT,
    "email" TEXT,
    "valuesJson" TEXT NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "adminMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegacyServiceApplicationArchive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegacyServiceApplicationFileArchive" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "fieldKey" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "storageName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LegacyServiceApplicationFileArchive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegacyServiceApplicationHistoryArchive" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "note" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LegacyServiceApplicationHistoryArchive_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ward_number_key" ON "Ward"("number");

-- CreateIndex
CREATE UNIQUE INDEX "Ward_sourceMetadataId_key" ON "Ward"("sourceMetadataId");

-- CreateIndex
CREATE UNIQUE INDEX "MapCategory_slug_key" ON "MapCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "MapPlace_slug_key" ON "MapPlace"("slug");

-- CreateIndex
CREATE INDEX "MapPlace_isPublished_isVerified_wardNumber_idx" ON "MapPlace"("isPublished", "isVerified", "wardNumber");

-- CreateIndex
CREATE INDEX "MapPlace_categoryId_idx" ON "MapPlace"("categoryId");

-- CreateIndex
CREATE INDEX "TourismImage_placeId_sortOrder_idx" ON "TourismImage"("placeId", "sortOrder");

-- CreateIndex
CREATE INDEX "TourismRating_placeId_rating_idx" ON "TourismRating"("placeId", "rating");

-- CreateIndex
CREATE UNIQUE INDEX "TourismRating_placeId_visitorHash_key" ON "TourismRating"("placeId", "visitorHash");

-- CreateIndex
CREATE INDEX "TourismReview_placeId_status_createdAt_idx" ON "TourismReview"("placeId", "status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "TourismReview_placeId_visitorHash_key" ON "TourismReview"("placeId", "visitorHash");

-- CreateIndex
CREATE INDEX "TourismReviewReport_status_createdAt_idx" ON "TourismReviewReport"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "TourismReviewReport_reviewId_visitorHash_key" ON "TourismReviewReport"("reviewId", "visitorHash");

-- CreateIndex
CREATE INDEX "TourismVisit_placeId_dayBucket_idx" ON "TourismVisit"("placeId", "dayBucket");

-- CreateIndex
CREATE UNIQUE INDEX "TourismVisit_placeId_visitorHash_dayBucket_key" ON "TourismVisit"("placeId", "visitorHash", "dayBucket");

-- CreateIndex
CREATE INDEX "TourismFavorite_visitorHash_idx" ON "TourismFavorite"("visitorHash");

-- CreateIndex
CREATE UNIQUE INDEX "TourismFavorite_placeId_visitorHash_key" ON "TourismFavorite"("placeId", "visitorHash");

-- CreateIndex
CREATE INDEX "MapBoundary_isPublished_layerType_wardNumber_idx" ON "MapBoundary"("isPublished", "layerType", "wardNumber");

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

-- CreateIndex
CREATE UNIQUE INDEX "OfficialService_slug_key" ON "OfficialService"("slug");

-- CreateIndex
CREATE INDEX "OfficialService_isPublished_verificationStatus_displayOrder_idx" ON "OfficialService"("isPublished", "verificationStatus", "displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "BudgetSourceDocument_sourceUrl_key" ON "BudgetSourceDocument"("sourceUrl");

-- CreateIndex
CREATE INDEX "BudgetSourceDocument_fiscalYear_status_checkedAt_idx" ON "BudgetSourceDocument"("fiscalYear", "status", "checkedAt");

-- CreateIndex
CREATE INDEX "BudgetAllocation_fiscalYear_wardNumber_idx" ON "BudgetAllocation"("fiscalYear", "wardNumber");

-- CreateIndex
CREATE INDEX "BudgetAllocation_fiscalYear_sectorKey_idx" ON "BudgetAllocation"("fiscalYear", "sectorKey");

-- CreateIndex
CREATE INDEX "BudgetAllocation_sourceDocumentId_idx" ON "BudgetAllocation"("sourceDocumentId");

-- CreateIndex
CREATE UNIQUE INDEX "LegacyMunicipalServiceCategoryArchive_slug_key" ON "LegacyMunicipalServiceCategoryArchive"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "LegacyMunicipalServiceArchive_slug_key" ON "LegacyMunicipalServiceArchive"("slug");

-- CreateIndex
CREATE INDEX "LegacyMunicipalServiceArchive_onlineEnabled_status_idx" ON "LegacyMunicipalServiceArchive"("onlineEnabled", "status");

-- CreateIndex
CREATE INDEX "LegacyMunicipalServiceArchive_categoryId_status_idx" ON "LegacyMunicipalServiceArchive"("categoryId", "status");

-- CreateIndex
CREATE INDEX "LegacyMunicipalServiceArchive_status_updatedAt_idx" ON "LegacyMunicipalServiceArchive"("status", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "LegacyServiceApplicationArchive_referenceId_key" ON "LegacyServiceApplicationArchive"("referenceId");

-- CreateIndex
CREATE INDEX "LegacyServiceApplicationArchive_createdAt_idx" ON "LegacyServiceApplicationArchive"("createdAt");

-- CreateIndex
CREATE INDEX "LegacyServiceApplicationArchive_serviceId_status_createdAt_idx" ON "LegacyServiceApplicationArchive"("serviceId", "status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "LegacyServiceApplicationFileArchive_storageName_key" ON "LegacyServiceApplicationFileArchive"("storageName");

-- CreateIndex
CREATE INDEX "LegacyServiceApplicationFileArchive_applicationId_fieldKey_idx" ON "LegacyServiceApplicationFileArchive"("applicationId", "fieldKey");

-- CreateIndex
CREATE INDEX "LegacyServiceApplicationHistoryArchive_applicationId_create_idx" ON "LegacyServiceApplicationHistoryArchive"("applicationId", "createdAt");

-- AddForeignKey
ALTER TABLE "Ward" ADD CONSTRAINT "Ward_sourceMetadataId_fkey" FOREIGN KEY ("sourceMetadataId") REFERENCES "SourceMetadata"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MapPlace" ADD CONSTRAINT "MapPlace_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "MapCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TourismImage" ADD CONSTRAINT "TourismImage_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "MapPlace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TourismRating" ADD CONSTRAINT "TourismRating_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "MapPlace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TourismReview" ADD CONSTRAINT "TourismReview_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "MapPlace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TourismReviewReport" ADD CONSTRAINT "TourismReviewReport_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "TourismReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TourismVisit" ADD CONSTRAINT "TourismVisit_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "MapPlace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TourismFavorite" ADD CONSTRAINT "TourismFavorite_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "MapPlace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "AppealComment" ADD CONSTRAINT "AppealComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "AppealComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppealReport" ADD CONSTRAINT "AppealReport_appealId_fkey" FOREIGN KEY ("appealId") REFERENCES "PublicAppeal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppealReport" ADD CONSTRAINT "AppealReport_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "AppealComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppealResponse" ADD CONSTRAINT "AppealResponse_appealId_fkey" FOREIGN KEY ("appealId") REFERENCES "PublicAppeal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppealStatusHistory" ADD CONSTRAINT "AppealStatusHistory_appealId_fkey" FOREIGN KEY ("appealId") REFERENCES "PublicAppeal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetAllocation" ADD CONSTRAINT "BudgetAllocation_sourceDocumentId_fkey" FOREIGN KEY ("sourceDocumentId") REFERENCES "BudgetSourceDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegacyMunicipalServiceArchive" ADD CONSTRAINT "LegacyMunicipalServiceArchive_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "LegacyMunicipalServiceCategoryArchive"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegacyServiceApplicationArchive" ADD CONSTRAINT "LegacyServiceApplicationArchive_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "LegacyMunicipalServiceArchive"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegacyServiceApplicationFileArchive" ADD CONSTRAINT "LegacyServiceApplicationFileArchive_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "LegacyServiceApplicationArchive"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegacyServiceApplicationHistoryArchive" ADD CONSTRAINT "LegacyServiceApplicationHistoryArchive_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "LegacyServiceApplicationArchive"("id") ON DELETE CASCADE ON UPDATE CASCADE;
