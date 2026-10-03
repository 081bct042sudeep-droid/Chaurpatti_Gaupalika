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
exports.OfficialDataImportService = void 0;
const common_1 = require("@nestjs/common");
const chaurpati_source_service_1 = require("./official/chaurpati/chaurpati-source.service");
let OfficialDataImportService = class OfficialDataImportService {
    constructor(source) {
        this.source = source;
        this.status = 'READY';
        this.lastBatch = null;
    }
    getDashboard() {
        return {
            sourceName: 'Chaurpati Rural Municipality',
            sourceUrl: this.source.baseUrl,
            status: this.status,
            lastSuccessfulSync: null,
            recordsFetched: 0,
            newRecords: 0,
            updatedRecords: 0,
            removedRecords: 0,
            conflicts: 0,
            failedRecords: 0,
            pendingApproval: 0,
            policy: 'Imported records never overwrite manually edited records automatically.',
        };
    }
    async fetchLatest() {
        this.status = 'FETCHING';
        const batch = await this.source.fetchPublicIndex();
        this.lastBatch = {
            id: `batch-${Date.now()}`,
            fetchedAt: new Date().toISOString(),
            sourceUrl: this.source.baseUrl,
            records: batch,
            verificationStatus: 'PENDING_REVIEW',
        };
        this.status = 'REVIEW_REQUIRED';
        return this.lastBatch;
    }
    getLastBatch() {
        return this.lastBatch ?? { message: 'No import batch has been fetched yet.' };
    }
};
exports.OfficialDataImportService = OfficialDataImportService;
exports.OfficialDataImportService = OfficialDataImportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [chaurpati_source_service_1.ChaurpatiSourceService])
], OfficialDataImportService);
//# sourceMappingURL=official-data-import.service.js.map