"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppealsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const appeal_enums_1 = require("./appeal-enums");
const node_crypto_1 = require("node:crypto");
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const appeals_service_1 = require("./appeals.service");
const appeals_security_1 = require("./appeals-security");
let AppealsController = class AppealsController {
    constructor(appeals, security) {
        this.appeals = appeals;
        this.security = security;
    }
    visitorToken() { return { token: this.security.issueVisitorToken() }; }
    categories() { return this.appeals.categories(); }
    mine(token) { return this.appeals.listMine(this.security.visitorHash(token)); }
    similar(title = '', description = '', wardId) { return this.appeals.similar(`${title} ${description}`, description, wardId); }
    list(query) { return this.appeals.listPublic(query); }
    detail(id) { return this.appeals.findPublic(id); }
    voteStatus(id, token) { return this.appeals.voteStatus(id, this.security.visitorHash(token)); }
    create(body, token) { return this.appeals.create(body, this.security.visitorHash(token)); }
    async upload(file, token) {
        this.security.visitorHash(token);
        const isJpeg = file?.buffer[0] === 0xff && file.buffer[1] === 0xd8 && file.buffer[2] === 0xff;
        const isPng = file?.buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
        const isWebp = file?.buffer.toString('ascii', 0, 4) === 'RIFF' && file.buffer.toString('ascii', 8, 12) === 'WEBP';
        if (!file || !['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype) || file.size > 5 * 1024 * 1024 || !(isJpeg || isPng || isWebp))
            throw new common_1.BadRequestException('Choose a valid JPG, PNG, or WEBP image up to 5 MB');
        const ext = file.mimetype === 'image/jpeg' ? 'jpg' : file.mimetype.split('/')[1];
        const dir = (0, node_path_1.join)(process.cwd(), 'uploads', 'appeals');
        await (0, promises_1.mkdir)(dir, { recursive: true });
        const filename = `${(0, node_crypto_1.randomUUID)()}.${ext}`;
        await (0, promises_1.writeFile)((0, node_path_1.join)(dir, filename), file.buffer, { flag: 'wx' });
        return { url: `/api/uploads/appeals/${filename}` };
    }
    vote(id, token) { return this.appeals.toggleVote(id, this.security.visitorHash(token)); }
    voteAgain(id, token) { return this.appeals.toggleVote(id, this.security.visitorHash(token)); }
    comments(id) { return this.appeals.findPublic(id).then((appeal) => appeal.comments); }
    comment(id, body, token) { return this.appeals.comment(id, body.content, this.security.visitorHash(token), body.parentId); }
    report(id, body, token) { return this.appeals.report(id, body.reason, body.description, this.security.visitorHash(token), body.commentId); }
    adminList(status) { return this.appeals.adminList(status); }
    adminDetail(id) { return this.appeals.adminDetail(id); }
    deleteAppeal(id) { return this.appeals.deleteAppeal(id); }
    edit(id, body) { return this.appeals.edit(id, body); }
    status(id, body) { return this.appeals.changeStatus(id, body.status, body.note); }
    response(id, response) { return this.appeals.response(id, response); }
    resolve(id, body) { return this.appeals.resolve(id, body.note, body.mediaUrl); }
    moderateComment(id, status) { return this.appeals.moderateComment(id, status); }
    reports() { return this.appeals.adminReports(); }
    moderateReport(id, status) { return this.appeals.moderateReport(id, status); }
    adminCategories() { return this.appeals.adminCategories(); }
    createCategory(body) { return this.appeals.saveCategory(body); }
    updateCategory(id, body) { return this.appeals.saveCategory({ ...body, id }); }
    deleteCategory(id) { return this.appeals.removeCategory(id); }
    analytics() { return this.appeals.analytics(); }
};
exports.AppealsController = AppealsController;
__decorate([
    (0, common_1.Get)('public-appeals/visitor-token'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppealsController.prototype, "visitorToken", null);
__decorate([
    (0, common_1.Get)('public-appeals/categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppealsController.prototype, "categories", null);
__decorate([
    (0, common_1.Get)('public-appeals/mine'),
    __param(0, (0, common_1.Headers)('x-visitor-token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppealsController.prototype, "mine", null);
__decorate([
    (0, common_1.Get)('public-appeals/similar'),
    __param(0, (0, common_1.Query)('title')),
    __param(1, (0, common_1.Query)('description')),
    __param(2, (0, common_1.Query)('wardId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", void 0)
], AppealsController.prototype, "similar", null);
__decorate([
    (0, common_1.Get)('public-appeals'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppealsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('public-appeals/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppealsController.prototype, "detail", null);
__decorate([
    (0, common_1.Get)('public-appeals/:id/vote'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Headers)('x-visitor-token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AppealsController.prototype, "voteStatus", null);
__decorate([
    (0, common_1.Post)('public-appeals'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-visitor-token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AppealsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('public-appeals/upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', { limits: { fileSize: 5 * 1024 * 1024 } })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Headers)('x-visitor-token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AppealsController.prototype, "upload", null);
__decorate([
    (0, common_1.Post)('public-appeals/:id/vote'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Headers)('x-visitor-token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AppealsController.prototype, "vote", null);
__decorate([
    (0, common_1.Delete)('public-appeals/:id/vote'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Headers)('x-visitor-token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AppealsController.prototype, "voteAgain", null);
__decorate([
    (0, common_1.Get)('public-appeals/:id/comments'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppealsController.prototype, "comments", null);
__decorate([
    (0, common_1.Post)('public-appeals/:id/comments'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('x-visitor-token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], AppealsController.prototype, "comment", null);
__decorate([
    (0, common_1.Post)('public-appeals/:id/report'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('x-visitor-token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], AppealsController.prototype, "report", null);
__decorate([
    (0, common_1.Get)('admin/public-appeals'),
    (0, common_1.UseGuards)(appeals_security_1.AdminApiKeyGuard),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppealsController.prototype, "adminList", null);
__decorate([
    (0, common_1.Get)('admin/public-appeals/:id'),
    (0, common_1.UseGuards)(appeals_security_1.AdminApiKeyGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppealsController.prototype, "adminDetail", null);
__decorate([
    (0, common_1.Delete)('admin/public-appeals/:id'),
    (0, common_1.UseGuards)(appeals_security_1.AdminApiKeyGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppealsController.prototype, "deleteAppeal", null);
__decorate([
    (0, common_1.Patch)('admin/public-appeals/:id'),
    (0, common_1.UseGuards)(appeals_security_1.AdminApiKeyGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AppealsController.prototype, "edit", null);
__decorate([
    (0, common_1.Patch)('admin/public-appeals/:id/status'),
    (0, common_1.UseGuards)(appeals_security_1.AdminApiKeyGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AppealsController.prototype, "status", null);
__decorate([
    (0, common_1.Post)('admin/public-appeals/:id/response'),
    (0, common_1.UseGuards)(appeals_security_1.AdminApiKeyGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('response')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AppealsController.prototype, "response", null);
__decorate([
    (0, common_1.Post)('admin/public-appeals/:id/resolve'),
    (0, common_1.UseGuards)(appeals_security_1.AdminApiKeyGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AppealsController.prototype, "resolve", null);
__decorate([
    (0, common_1.Patch)('admin/appeal-comments/:id/moderation'),
    (0, common_1.UseGuards)(appeals_security_1.AdminApiKeyGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AppealsController.prototype, "moderateComment", null);
__decorate([
    (0, common_1.Get)('admin/appeal-reports'),
    (0, common_1.UseGuards)(appeals_security_1.AdminApiKeyGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppealsController.prototype, "reports", null);
__decorate([
    (0, common_1.Patch)('admin/appeal-reports/:id'),
    (0, common_1.UseGuards)(appeals_security_1.AdminApiKeyGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AppealsController.prototype, "moderateReport", null);
__decorate([
    (0, common_1.Get)('admin/appeal-categories'),
    (0, common_1.UseGuards)(appeals_security_1.AdminApiKeyGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppealsController.prototype, "adminCategories", null);
__decorate([
    (0, common_1.Post)('admin/appeal-categories'),
    (0, common_1.UseGuards)(appeals_security_1.AdminApiKeyGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppealsController.prototype, "createCategory", null);
__decorate([
    (0, common_1.Patch)('admin/appeal-categories/:id'),
    (0, common_1.UseGuards)(appeals_security_1.AdminApiKeyGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AppealsController.prototype, "updateCategory", null);
__decorate([
    (0, common_1.Delete)('admin/appeal-categories/:id'),
    (0, common_1.UseGuards)(appeals_security_1.AdminApiKeyGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppealsController.prototype, "deleteCategory", null);
__decorate([
    (0, common_1.Get)('admin/appeal-analytics'),
    (0, common_1.UseGuards)(appeals_security_1.AdminApiKeyGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppealsController.prototype, "analytics", null);
exports.AppealsController = AppealsController = __decorate([
    (0, common_1.Controller)('v1'),
    (0, common_1.UseGuards)(appeals_security_1.AppealsRateLimitGuard),
    __metadata("design:paramtypes", [appeals_service_1.AppealsService, appeals_security_1.AppealsSecurityService])
], AppealsController);
//# sourceMappingURL=appeals.controller.js.map