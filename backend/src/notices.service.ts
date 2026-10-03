import { Injectable, NotFoundException } from '@nestjs/common';

export type NoticeRecord = {
  id: string;
  title: string;
  summary: string;
  imageUrl?: string;
  published: boolean;
  updatedAt: string;
};

@Injectable()
export class NoticesService {
  private notices: NoticeRecord[] = [];

  list() {
    return this.notices;
  }

  create(input: Omit<NoticeRecord, 'id' | 'updatedAt'>) {
    const notice: NoticeRecord = { ...input, id: `notice-${Date.now()}-${Math.random().toString(36).slice(2)}`, updatedAt: new Date().toISOString() };
    this.notices = [notice, ...this.notices];
    return notice;
  }

  update(id: string, input: Partial<Omit<NoticeRecord, 'id' | 'updatedAt'>>) {
    const index = this.notices.findIndex((notice) => notice.id === id);
    if (index < 0) throw new NotFoundException('Notice not found');
    this.notices[index] = { ...this.notices[index], ...input, updatedAt: new Date().toISOString() };
    return this.notices[index];
  }

  remove(id: string) {
    const before = this.notices.length;
    this.notices = this.notices.filter((notice) => notice.id !== id);
    if (before === this.notices.length) throw new NotFoundException('Notice not found');
    return { deleted: true };
  }
}
