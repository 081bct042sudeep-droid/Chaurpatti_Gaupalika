CREATE TABLE "MunicipalServiceCategory" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "slug" TEXT NOT NULL,
  "nameNp" TEXT NOT NULL,
  "nameEn" TEXT NOT NULL,
  "icon" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE UNIQUE INDEX "MunicipalServiceCategory_slug_key" ON "MunicipalServiceCategory"("slug");

CREATE TABLE "MunicipalService" (
  "id" TEXT NOT NULL PRIMARY KEY,
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
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  "publishedAt" DATETIME,
  CONSTRAINT "MunicipalService_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "MunicipalServiceCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "MunicipalService_slug_key" ON "MunicipalService"("slug");
CREATE INDEX "MunicipalService_status_updatedAt_idx" ON "MunicipalService"("status", "updatedAt");
CREATE INDEX "MunicipalService_categoryId_status_idx" ON "MunicipalService"("categoryId", "status");
CREATE INDEX "MunicipalService_onlineEnabled_status_idx" ON "MunicipalService"("onlineEnabled", "status");

CREATE TABLE "ServiceApplication" (
  "id" TEXT NOT NULL PRIMARY KEY,
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
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "ServiceApplication_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "MunicipalService"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "ServiceApplication_referenceId_key" ON "ServiceApplication"("referenceId");
CREATE INDEX "ServiceApplication_serviceId_status_createdAt_idx" ON "ServiceApplication"("serviceId", "status", "createdAt");
CREATE INDEX "ServiceApplication_createdAt_idx" ON "ServiceApplication"("createdAt");

CREATE TABLE "ServiceApplicationHistory" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "applicationId" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "note" TEXT,
  "createdBy" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ServiceApplicationHistory_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "ServiceApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "ServiceApplicationHistory_applicationId_createdAt_idx" ON "ServiceApplicationHistory"("applicationId", "createdAt");
