CREATE TABLE "ServiceApplicationFile" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "applicationId" TEXT NOT NULL,
  "fieldKey" TEXT NOT NULL,
  "originalName" TEXT NOT NULL,
  "storageName" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ServiceApplicationFile_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "ServiceApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "ServiceApplicationFile_storageName_key" ON "ServiceApplicationFile"("storageName");
CREATE INDEX "ServiceApplicationFile_applicationId_fieldKey_idx" ON "ServiceApplicationFile"("applicationId", "fieldKey");
