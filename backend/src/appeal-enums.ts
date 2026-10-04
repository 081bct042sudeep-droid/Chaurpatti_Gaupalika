export const AppealType = { PROBLEM: 'PROBLEM', SUGGESTION: 'SUGGESTION' } as const;
export type AppealType = (typeof AppealType)[keyof typeof AppealType];

export const AppealStatus = {
  PENDING: 'PENDING', APPROVED: 'APPROVED', UNDER_REVIEW: 'UNDER_REVIEW', FORWARDED: 'FORWARDED',
  IN_PROGRESS: 'IN_PROGRESS', RESOLVED: 'RESOLVED', REJECTED: 'REJECTED', ARCHIVED: 'ARCHIVED',
} as const;
export type AppealStatus = (typeof AppealStatus)[keyof typeof AppealStatus];

export const CommentStatus = { VISIBLE: 'VISIBLE', PENDING: 'PENDING', HIDDEN: 'HIDDEN', DELETED: 'DELETED' } as const;
export type CommentStatus = (typeof CommentStatus)[keyof typeof CommentStatus];

export const ReportStatus = { PENDING: 'PENDING', REVIEWED: 'REVIEWED', RESOLVED: 'RESOLVED', DISMISSED: 'DISMISSED' } as const;
export type ReportStatus = (typeof ReportStatus)[keyof typeof ReportStatus];
