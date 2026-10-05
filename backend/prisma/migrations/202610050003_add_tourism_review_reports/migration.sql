CREATE TABLE "TourismReviewReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reviewId" TEXT NOT NULL,
    "visitorHash" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TourismReviewReport_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "TourismReview" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "TourismReviewReport_reviewId_visitorHash_key" ON "TourismReviewReport"("reviewId", "visitorHash");
CREATE INDEX "TourismReviewReport_status_createdAt_idx" ON "TourismReviewReport"("status", "createdAt");
