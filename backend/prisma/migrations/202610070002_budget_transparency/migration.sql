CREATE TABLE "BudgetSourceDocument" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "sourceUrl" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "fiscalYear" TEXT NOT NULL,
  "fileHash" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'NEEDS_REVIEW',
  "sourceUpdatedAt" DATETIME,
  "checkedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "importedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "totalNpr" REAL,
  "extractedRows" INTEGER NOT NULL DEFAULT 0,
  "validRows" INTEGER NOT NULL DEFAULT 0,
  "warningsJson" TEXT NOT NULL DEFAULT '[]',
  "lastError" TEXT
);
CREATE UNIQUE INDEX "BudgetSourceDocument_sourceUrl_key" ON "BudgetSourceDocument"("sourceUrl");
CREATE INDEX "BudgetSourceDocument_fiscalYear_status_checkedAt_idx" ON "BudgetSourceDocument"("fiscalYear", "status", "checkedAt");

CREATE TABLE "BudgetAllocation" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "sourceDocumentId" TEXT NOT NULL,
  "fiscalYear" TEXT NOT NULL,
  "wardNumber" INTEGER,
  "projectName" TEXT NOT NULL,
  "sector" TEXT NOT NULL,
  "sectorKey" TEXT NOT NULL,
  "expenditureHead" TEXT,
  "budgetCode" TEXT,
  "amountNpr" REAL NOT NULL,
  "rawAmount" TEXT NOT NULL,
  "rawRow" TEXT NOT NULL,
  "rowNumber" INTEGER,
  "confidence" REAL NOT NULL DEFAULT 0,
  CONSTRAINT "BudgetAllocation_sourceDocumentId_fkey" FOREIGN KEY ("sourceDocumentId") REFERENCES "BudgetSourceDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "BudgetAllocation_fiscalYear_wardNumber_idx" ON "BudgetAllocation"("fiscalYear", "wardNumber");
CREATE INDEX "BudgetAllocation_fiscalYear_sectorKey_idx" ON "BudgetAllocation"("fiscalYear", "sectorKey");
CREATE INDEX "BudgetAllocation_sourceDocumentId_idx" ON "BudgetAllocation"("sourceDocumentId");
