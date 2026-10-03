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
        const notice = { ...input, id: crypto.randomUUID(), updatedAt: new Date().toISOString() };
        this.notices = [notice, ...this.notices];
        return notice;
    }
    update(id, input) {
        this.notices = this.notices.map((notice) => notice.id === id ? { ...notice, ...input, updatedAt: new Date().toISOString() } : notice);
        return this.notices.find((notice) => notice.id === id) ?? null;
    }
    remove(id) {
        this.notices = this.notices.filter((notice) => notice.id !== id);
        return { success: true };
    }
};
exports.NoticesService = NoticesService;
exports.NoticesService = NoticesService = __decorate([
    (0, common_1.Injectable)()
], NoticesService);
//# sourceMappingURL=notices.service.js.map