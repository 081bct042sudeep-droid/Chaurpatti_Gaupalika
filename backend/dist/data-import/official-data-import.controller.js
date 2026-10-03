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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfficialDataImportController = void 0;
const common_1 = require("@nestjs/common");
const official_data_import_service_1 = require("./official-data-import.service");
let OfficialDataImportController = class OfficialDataImportController {
    constructor(imports) {
        this.imports = imports;
    }
    getDashboard() {
        return this.imports.getDashboard();
    }
    getLatest() {
        return this.imports.getLastBatch();
    }
    fetchLatest() {
        return this.imports.fetchLatest();
    }
};
exports.OfficialDataImportController = OfficialDataImportController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OfficialDataImportController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('latest'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OfficialDataImportController.prototype, "getLatest", null);
__decorate([
    (0, common_1.Post)('fetch'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OfficialDataImportController.prototype, "fetchLatest", null);
exports.OfficialDataImportController = OfficialDataImportController = __decorate([
    (0, common_1.Controller)('admin/data-import'),
    __metadata("design:paramtypes", [official_data_import_service_1.OfficialDataImportService])
], OfficialDataImportController);
//# sourceMappingURL=official-data-import.controller.js.map