PRAGMA foreign_keys=OFF;

CREATE TABLE "new_MapPlace" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "nameNp" TEXT NOT NULL,
    "nameEn" TEXT,
    "descriptionNp" TEXT,
    "descriptionEn" TEXT,
    "categoryId" TEXT,
    "wardNumber" INTEGER,
    "latitude" REAL,
    "longitude" REAL,
    "geometryType" TEXT NOT NULL DEFAULT 'POINT',
    "geometry" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "imageUrl" TEXT,
    "openingHours" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "sourceName" TEXT,
    "sourceUrl" TEXT,
    "verifiedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
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
    "averageRating" REAL NOT NULL DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "MapPlace_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "MapCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "new_MapPlace" (
    "id", "slug", "nameNp", "nameEn", "descriptionNp", "descriptionEn", "categoryId", "wardNumber", "latitude", "longitude", "geometryType", "geometry", "address", "phone", "email", "website", "imageUrl", "openingHours", "isPublished", "isVerified", "sourceName", "sourceUrl", "verifiedAt", "createdAt", "updatedAt", "isTourism", "tourismStatus", "shortDescriptionNp", "shortDescriptionEn", "historyNp", "historyEn", "culturalSignificanceNp", "culturalSignificanceEn", "religiousSignificanceNp", "religiousSignificanceEn", "naturalFeaturesNp", "naturalFeaturesEn", "activitiesNp", "activitiesEn", "bestTimeNp", "bestTimeEn", "howToReachNp", "howToReachEn", "facilitiesNp", "facilitiesEn", "safetyInfoNp", "safetyInfoEn", "emergencyInfoNp", "emergencyInfoEn", "viewCount", "averageRating", "ratingCount"
)
SELECT
    "id", "slug", "nameNp", "nameEn", "descriptionNp", "descriptionEn", "categoryId", "wardNumber", "latitude", "longitude", "geometryType", "geometry", "address", "phone", "email", "website", "imageUrl", "openingHours", "isPublished", "isVerified", "sourceName", "sourceUrl", "verifiedAt", "createdAt", "updatedAt", "isTourism", "tourismStatus", "shortDescriptionNp", "shortDescriptionEn", "historyNp", "historyEn", "culturalSignificanceNp", "culturalSignificanceEn", "religiousSignificanceNp", "religiousSignificanceEn", "naturalFeaturesNp", "naturalFeaturesEn", "activitiesNp", "activitiesEn", "bestTimeNp", "bestTimeEn", "howToReachNp", "howToReachEn", "facilitiesNp", "facilitiesEn", "safetyInfoNp", "safetyInfoEn", "emergencyInfoNp", "emergencyInfoEn", "viewCount", "averageRating", "ratingCount"
FROM "MapPlace";

DROP TABLE "MapPlace";
ALTER TABLE "new_MapPlace" RENAME TO "MapPlace";

CREATE UNIQUE INDEX "MapPlace_slug_key" ON "MapPlace"("slug");
CREATE INDEX "MapPlace_isPublished_isVerified_wardNumber_idx" ON "MapPlace"("isPublished", "isVerified", "wardNumber");
CREATE INDEX "MapPlace_categoryId_idx" ON "MapPlace"("categoryId");
CREATE INDEX "MapPlace_isTourism_tourismStatus_idx" ON "MapPlace"("isTourism", "tourismStatus");

PRAGMA foreign_keys=ON;
