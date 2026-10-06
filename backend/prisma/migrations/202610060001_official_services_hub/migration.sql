-- Preserve legacy service/application data under archive table names before retiring its APIs.
ALTER TABLE "ServiceApplicationFile" RENAME TO "LegacyServiceApplicationFileArchive";
ALTER TABLE "ServiceApplicationHistory" RENAME TO "LegacyServiceApplicationHistoryArchive";
ALTER TABLE "ServiceApplication" RENAME TO "LegacyServiceApplicationArchive";
ALTER TABLE "MunicipalService" RENAME TO "LegacyMunicipalServiceArchive";
ALTER TABLE "MunicipalServiceCategory" RENAME TO "LegacyMunicipalServiceCategoryArchive";

CREATE TABLE "OfficialService" (
  "id" TEXT NOT NULL PRIMARY KEY,
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
  "verifiedAt" DATETIME,
  "verifiedBy" TEXT,
  "notes" TEXT,
  "keywordsJson" TEXT NOT NULL DEFAULT '[]',
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  "isPublished" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "OfficialService_slug_key" ON "OfficialService"("slug");
CREATE INDEX "OfficialService_isPublished_verificationStatus_displayOrder_idx" ON "OfficialService"("isPublished", "verificationStatus", "displayOrder");

INSERT INTO "OfficialService" ("id", "slug", "nameNp", "nameEn", "categoryNp", "categoryEn", "descriptionNp", "descriptionEn", "officialWebsiteUrl", "officialFormUrl", "officialSourceUrl", "sourceName", "sourceDocumentName", "verificationStatus", "notes", "keywordsJson", "displayOrder", "isPublished") VALUES
('official-birth-registration', 'birth-registration', 'जन्म दर्ता', 'Birth Registration', 'घटना दर्ता', 'Vital Registration', NULL, 'The municipality lists a birth notification form on its official sample forms page. Current instructions and form validity still need confirmation.', 'https://chaurpatimun.gov.np/vital-registration', 'https://chaurpatimun.gov.np/sites/chaurpatimun.gov.np/files/Janma%20Darta%20nibedan%20Anusuchi%20Faram.pdf', 'https://chaurpatimun.gov.np/sample-forms', 'Chaurpati Rural Municipality', 'Birth notification form; listed under fiscal year 2074/75 (2018)', 'OUTDATED', 'The linked municipal form is listed under fiscal year 2074/75 (2018). Review its current validity and exact field labels before publishing any instructions.', '["janma", "birth", "जन्म दर्ता"]', 10, 1),
('official-death-registration', 'death-registration', 'मृत्यु दर्ता', 'Death Registration', 'घटना दर्ता', 'Vital Registration', NULL, 'The municipality lists a death notification form on its official sample forms page. Current instructions and form validity still need confirmation.', 'https://chaurpatimun.gov.np/vital-registration', 'https://chaurpatimun.gov.np/sites/chaurpatimun.gov.np/files/Mirityu%20Darta%20Faram%20Dhacha.pdf', 'https://chaurpatimun.gov.np/sample-forms', 'Chaurpati Rural Municipality', 'Death notification form; listed under fiscal year 2074/75 (2018)', 'OUTDATED', 'The linked municipal form is listed under fiscal year 2074/75 (2018). Review its current validity and exact field labels before publishing any instructions.', '["mrityu", "death", "मृत्यु दर्ता"]', 20, 1);
