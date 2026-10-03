"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoticesService = void 0;
const common_1 = require("@nestjs/common");
let NoticesService = class NoticesService {
    constructor() {
        this.notices = [];
    }
    list() {
        return this.notices;
    }
    create(input) {
        const notice = { ...input, id: `notice-${Date.now()}-${Math.random().toString(36).slice(2)}`, updatedAt: new Date().toISOString() };
        this.notices = [notice, ...this.notices];
        return notice;
    }
    update(id, input) {
        const index = this.notices.findIndex((notice) => notice.id === id);
        if (index < 0)
            throw new common_1.NotFoundException('Notice not found');
        this.notices[index] = { ...this.notices[index], ...input, updatedAt: new Date().toISOString() };
        return this.notices[index];
    }
    remove(id) {
        const before = this.notices.length;
        this.notices = this.notices.filter((notice) => notice.id !== id);
        if (before === this.notices.length)
            throw new common_1.NotFoundException('Notice not found');
        return { deleted: true };
    }
};
exports.NoticesService = NoticesService;
exports.NoticesService = NoticesService = __decorate([
    (0, common_1.Injectable)()
], NoticesService);
//# sourceMappingURL=notices.service.js.map