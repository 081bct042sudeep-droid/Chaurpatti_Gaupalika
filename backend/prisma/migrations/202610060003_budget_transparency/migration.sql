CREATE TABLE "BudgetSourceDocument" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "documentKey" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "documentType" TEXT NOT NULL DEFAULT 'BUDGET_PROGRAM',
  "fiscalYear" TEXT,
  "sourceUrl" TEXT NOT NULL,
  "sourcePageUrl" TEXT NOT NULL,
  "publishedAt" DATETIME,
  "downloadedAt" DATETIME,
  "lastCheckedAt" DATETIME,
  "sourceEtag" TEXT,
  "sourceLastModified" TEXT,
  "fileHash" TEXT,
  "storagePath" TEXT,
  "fileSize" INTEGER,
  "mimeType" TEXT,
  "status" TEXT NOT NULL DEFAULT 'DISCOVERED',
  "parserVersion" TEXT,
  "pageCount" INTEGER,
  "extractedText" TEXT,
  "extractionConfidence" REAL,
  "officialHeadlineRaw" TEXT,
  "officialHeadlineNpr" BIGINT,
  "calculatedTotalNpr" BIGINT,
  "warningsJson" TEXT NOT NULL DEFAULT '[]',
  "lastError" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "BudgetSourceDocument_fileHash_key" ON "BudgetSourceDocument"("fileHash");
CREATE INDEX "BudgetSourceDocument_fiscalYear_status_documentType_idx" ON "BudgetSourceDocument"("fiscalYear", "status", "documentType");
CREATE INDEX "BudgetSourceDocument_documentKey_updatedAt_idx" ON "BudgetSourceDocument"("documentKey", "updatedAt");

CREATE TABLE "BudgetImportBatch" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "sourceDocumentId" TEXT,
  "sourcePageUrl" TEXT,
  "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" DATETIME,
  "status" TEXT NOT NULL DEFAULT 'DISCOVERED',
  "rowsDiscovered" INTEGER NOT NULL DEFAULT 0,
  "rowsImported" INTEGER NOT NULL DEFAULT 0,
  "rowsUpdated" INTEGER NOT NULL DEFAULT 0,
  "rowsRejected" INTEGER NOT NULL DEFAULT 0,
  "warningsJson" TEXT NOT NULL DEFAULT '[]',
  "errorsJson" TEXT NOT NULL DEFAULT '[]',
  "parserVersion" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BudgetImportBatch_sourceDocumentId_fkey" FOREIGN KEY ("sourceDocumentId") REFERENCES "BudgetSourceDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "BudgetImportBatch_sourceDocumentId_startedAt_idx" ON "BudgetImportBatch"("sourceDocumentId", "startedAt");
CREATE INDEX "BudgetImportBatch_status_startedAt_idx" ON "BudgetImportBatch"("status", "startedAt");

CREATE TABLE "BudgetAllocation" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "sourceDocumentId" TEXT NOT NULL,
  "fiscalYear" TEXT NOT NULL,
  "wardNumber" INTEGER,
  "department" TEXT,
  "sector" TEXT,
  "subsector" TEXT,
  "program" TEXT,
  "project" TEXT,
  "budgetHead" TEXT,
  "budgetHeadCode" TEXT,
  "fundingSource" TEXT,
  "budgetType" TEXT,
  "allocatedAmountNpr" BIGINT,
  "revisedAmountNpr" BIGINT,
  "releasedAmountNpr" BIGINT,
  "spentAmountNpr" BIGINT,
  "remainingAmountNpr" BIGINT,
  "rawAmount" TEXT,
  "rawRow" TEXT NOT NULL,
  "rawPageNumber" INTEGER,
  "rawTableNumber" INTEGER,
  "confidenceScore" REAL NOT NULL DEFAULT 0,
  "classificationMethod" TEXT NOT NULL DEFAULT 'UNCLASSIFIED',
  "verificationStatus" TEXT NOT NULL DEFAULT 'NEEDS_REVIEW',
  "budgetStatus" TEXT NOT NULL DEFAULT 'UNKNOWN',
  "reviewNote" TEXT,
  "reviewedAt" DATETIME,
  "reviewedBy" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BudgetAllocation_sourceDocumentId_fkey" FOREIGN KEY ("sourceDocumentId") REFERENCES "BudgetSourceDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "BudgetAllocation_fiscalYear_verificationStatus_wardNumber_idx" ON "BudgetAllocation"("fiscalYear", "verificationStatus", "wardNumber");
CREATE INDEX "BudgetAllocation_fiscalYear_sector_verificationStatus_idx" ON "BudgetAllocation"("fiscalYear", "sector", "verificationStatus");
CREATE INDEX "BudgetAllocation_sourceDocumentId_verificationStatus_idx" ON "BudgetAllocation"("sourceDocumentId", "verificationStatus");
CREATE INDEX "BudgetAllocation_budgetHeadCode_idx" ON "BudgetAllocation"("budgetHeadCode");
