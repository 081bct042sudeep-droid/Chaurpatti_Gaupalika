ALTER TABLE "MapCategory" ADD COLUMN "isTourism" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "MapPlace" ADD COLUMN "isTourism" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "MapPlace" ADD COLUMN "tourismStatus" TEXT NOT NULL DEFAULT 'DRAFT';
ALTER TABLE "MapPlace" ADD COLUMN "shortDescriptionNp" TEXT;
ALTER TABLE "MapPlace" ADD COLUMN "shortDescriptionEn" TEXT;
ALTER TABLE "MapPlace" ADD COLUMN "historyNp" TEXT;
ALTER TABLE "MapPlace" ADD COLUMN "historyEn" TEXT;
ALTER TABLE "MapPlace" ADD COLUMN "culturalSignificanceNp" TEXT;
ALTER TABLE "MapPlace" ADD COLUMN "culturalSignificanceEn" TEXT;
ALTER TABLE "MapPlace" ADD COLUMN "religiousSignificanceNp" TEXT;
ALTER TABLE "MapPlace" ADD COLUMN "religiousSignificanceEn" TEXT;
ALTER TABLE "MapPlace" ADD COLUMN "naturalFeaturesNp" TEXT;
ALTER TABLE "MapPlace" ADD COLUMN "naturalFeaturesEn" TEXT;
ALTER TABLE "MapPlace" ADD COLUMN "activitiesNp" TEXT;
ALTER TABLE "MapPlace" ADD COLUMN "activitiesEn" TEXT;
ALTER TABLE "MapPlace" ADD COLUMN "bestTimeNp" TEXT;
ALTER TABLE "MapPlace" ADD COLUMN "bestTimeEn" TEXT;
ALTER TABLE "MapPlace" ADD COLUMN "howToReachNp" TEXT;
ALTER TABLE "MapPlace" ADD COLUMN "howToReachEn" TEXT;
ALTER TABLE "MapPlace" ADD COLUMN "facilitiesNp" TEXT;
ALTER TABLE "MapPlace" ADD COLUMN "facilitiesEn" TEXT;
ALTER TABLE "MapPlace" ADD COLUMN "safetyInfoNp" TEXT;
ALTER TABLE "MapPlace" ADD COLUMN "safetyInfoEn" TEXT;
ALTER TABLE "MapPlace" ADD COLUMN "emergencyInfoNp" TEXT;
ALTER TABLE "MapPlace" ADD COLUMN "emergencyInfoEn" TEXT;
ALTER TABLE "MapPlace" ADD COLUMN "viewCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "MapPlace" ADD COLUMN "averageRating" REAL NOT NULL DEFAULT 0;
ALTER TABLE "MapPlace" ADD COLUMN "ratingCount" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX "MapPlace_isTourism_tourismStatus_idx" ON "MapPlace"("isTourism", "tourismStatus");

CREATE TABLE "TourismImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "placeId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "captionNp" TEXT,
    "captionEn" TEXT,
    "altText" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TourismImage_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "MapPlace" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "TourismImage_placeId_sortOrder_idx" ON "TourismImage"("placeId", "sortOrder");

CREATE TABLE "TourismRating" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "placeId" TEXT NOT NULL,
    "visitorHash" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TourismRating_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "MapPlace" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "TourismRating_placeId_visitorHash_key" ON "TourismRating"("placeId", "visitorHash");
CREATE INDEX "TourismRating_placeId_rating_idx" ON "TourismRating"("placeId", "rating");

CREATE TABLE "TourismReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "placeId" TEXT NOT NULL,
    "visitorHash" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TourismReview_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "MapPlace" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "TourismReview_placeId_visitorHash_key" ON "TourismReview"("placeId", "visitorHash");
CREATE INDEX "TourismReview_placeId_status_createdAt_idx" ON "TourismReview"("placeId", "status", "createdAt");

CREATE TABLE "TourismVisit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "placeId" TEXT NOT NULL,
    "visitorHash" TEXT NOT NULL,
    "dayBucket" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TourismVisit_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "MapPlace" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "TourismVisit_placeId_visitorHash_dayBucket_key" ON "TourismVisit"("placeId", "visitorHash", "dayBucket");
CREATE INDEX "TourismVisit_placeId_dayBucket_idx" ON "TourismVisit"("placeId", "dayBucket");

CREATE TABLE "TourismFavorite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "placeId" TEXT NOT NULL,
    "visitorHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TourismFavorite_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "MapPlace" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "TourismFavorite_placeId_visitorHash_key" ON "TourismFavorite"("placeId", "visitorHash");
CREATE INDEX "TourismFavorite_visitorHash_idx" ON "TourismFavorite"("visitorHash");
