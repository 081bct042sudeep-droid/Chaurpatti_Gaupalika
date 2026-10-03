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
const client_1 = require("@prisma/client");
const appeals_service_1 = require("./appeals.service");
let AppealsController = class AppealsController {
    constructor(appeals) {
        this.appeals = appeals;
    }
    categories() { return this.appeals.categories(); }
    list(query) { return this.appeals.listPublic(query); }
    detail(id) { return this.appeals.findPublic(id); }
    create(body) { return this.appeals.create(body); }
    vote(id, visitorId) { return this.appeals.toggleVote(id, visitorId); }
    voteAgain(id, visitorId) { return this.appeals.toggleVote(id, visitorId); }
    comments(id) { return this.appeals.findPublic(id).then((appeal) => appeal.comments); }
    comment(id, content, visitorId) { return this.appeals.comment(id, content, visitorId); }
    report(id, body, visitorId) { return this.appeals.report(id, body.reason, body.description, visitorId); }
    adminList(status) { return this.appeals.adminList(status); }
    status(id, body) { return this.appeals.changeStatus(id, body.status, body.note); }
    response(id, response) { return this.appeals.response(id, response); }
    resolve(id, note) { return this.appeals.resolve(id, note); }
};
exports.AppealsController = AppealsController;
__decorate([
    (0, common_1.Get)('v1/public-appeals/categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppealsController.prototype, "categories", null);
__decorate([
    (0, common_1.Get)('v1/public-appeals'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppealsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('v1/public-appeals/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppealsController.prototype, "detail", null);
__decorate([
    (0, common_1.Post)('v1/public-appeals'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppealsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('v1/public-appeals/:id/vote'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Headers)('x-visitor-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AppealsController.prototype, "vote", null);
__decorate([
    (0, common_1.Delete)('v1/public-appeals/:id/vote'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Headers)('x-visitor-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AppealsController.prototype, "voteAgain", null);
__decorate([
    (0, common_1.Get)('v1/public-appeals/:id/comments'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppealsController.prototype, "comments", null);
__decorate([
    (0, common_1.Post)('v1/public-appeals/:id/comments'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('content')),
    __param(2, (0, common_1.Headers)('x-visitor-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AppealsController.prototype, "comment", null);
__decorate([
    (0, common_1.Post)('v1/public-appeals/:id/report'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('x-visitor-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], AppealsController.prototype, "report", null);
__decorate([
    (0, common_1.Get)('v1/admin/public-appeals'),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppealsController.prototype, "adminList", null);
__decorate([
    (0, common_1.Patch)('v1/admin/public-appeals/:id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AppealsController.prototype, "status", null);
__decorate([
    (0, common_1.Post)('v1/admin/public-appeals/:id/response'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('response')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AppealsController.prototype, "response", null);
__decorate([
    (0, common_1.Post)('v1/admin/public-appeals/:id/resolve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('note')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AppealsController.prototype, "resolve", null);
exports.AppealsController = AppealsController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [appeals_service_1.AppealsService])
], AppealsController);
//# sourceMappingURL=appeals.controller.js.map