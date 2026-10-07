import { join, resolve } from 'node:path';

const configuredUploadsPath = process.env.UPLOADS_DIR?.trim();

export const uploadsRoot = resolve(configuredUploadsPath || join(process.cwd(), 'uploads'));

export function uploadDirectory(area: 'appeals' | 'map' | 'tourism' | 'notices') {
  return join(uploadsRoot, area);
}
