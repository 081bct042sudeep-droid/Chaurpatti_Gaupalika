CREATE TABLE "MapCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "nameNp" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "icon" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
CREATE UNIQUE INDEX "MapCategory_slug_key" ON "MapCategory"("slug");

CREATE TABLE "MapPlace" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "nameNp" TEXT NOT NULL,
    "nameEn" TEXT,
    "descriptionNp" TEXT,
    "descriptionEn" TEXT,
    "categoryId" TEXT NOT NULL,
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
    CONSTRAINT "MapPlace_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "MapCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "MapPlace_slug_key" ON "MapPlace"("slug");
CREATE INDEX "MapPlace_isPublished_isVerified_wardNumber_idx" ON "MapPlace"("isPublished", "isVerified", "wardNumber");
CREATE INDEX "MapPlace_categoryId_idx" ON "MapPlace"("categoryId");

CREATE TABLE "MapBoundary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "layerType" TEXT NOT NULL DEFAULT 'WARD_BOUNDARY',
    "wardNumber" INTEGER,
    "geoJson" TEXT NOT NULL,
    "sourceName" TEXT,
    "sourceUrl" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
CREATE INDEX "MapBoundary_isPublished_layerType_wardNumber_idx" ON "MapBoundary"("isPublished", "layerType", "wardNumber");
