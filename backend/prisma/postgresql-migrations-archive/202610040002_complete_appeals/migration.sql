ALTER TABLE "PublicAppeal"
ADD COLUMN "resolutionNote" TEXT,
ADD COLUMN "resolutionMediaUrl" TEXT;

ALTER TABLE "AppealComment"
ADD CONSTRAINT "AppealComment_parentId_fkey"
FOREIGN KEY ("parentId") REFERENCES "AppealComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AppealReport"
ADD CONSTRAINT "AppealReport_commentId_fkey"
FOREIGN KEY ("commentId") REFERENCES "AppealComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "AppealReport_status_createdAt_idx" ON "AppealReport"("status", "createdAt");

UPDATE "PublicAppeal" AS appeal
SET "supportCount" = (SELECT COUNT(*)::INTEGER FROM "AppealVote" AS vote WHERE vote."appealId" = appeal."id"),
    "commentCount" = (SELECT COUNT(*)::INTEGER FROM "AppealComment" AS comment WHERE comment."appealId" = appeal."id" AND comment."status" = 'VISIBLE');
