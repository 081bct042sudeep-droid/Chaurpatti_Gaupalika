"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChaurpatiSourceService = void 0;
const common_1 = require("@nestjs/common");
let ChaurpatiSourceService = class ChaurpatiSourceService {
    constructor() {
        this.baseUrl = 'https://chaurpatimun.gov.np/';
    }
    async fetchPublicIndex() {
        try {
            const response = await fetch(this.baseUrl, { signal: AbortSignal.timeout(15_000) });
            if (!response.ok) {
                throw new Error(`Official source returned ${response.status}`);
            }
            const html = await response.text();
            return {
                sourceType: 'OFFICIAL_MUNICIPALITY_WEBSITE',
                sourceName: 'Chaurpati Rural Municipality',
                sourceUrl: this.baseUrl,
                sourceRecordId: 'homepage',
                sourcePublishedAt: null,
                lastFetchedAt: new Date().toISOString(),
                verificationStatus: 'PENDING_REVIEW',
                manuallyEdited: false,
                title: this.extractTitle(html),
                rawLength: html.length,
            };
        }
        catch {
            throw new common_1.ServiceUnavailableException('The official website is temporarily unavailable. No data was imported.');
        }
    }
    extractTitle(html) {
        const match = html.match(/<title[^>]*>(.*?)<\/title>/is);
        return match?.[1]?.replace(/\s+/g, ' ').trim() ?? null;
    }
};
exports.ChaurpatiSourceService = ChaurpatiSourceService;
exports.ChaurpatiSourceService = ChaurpatiSourceService = __decorate([
    (0, common_1.Injectable)()
], ChaurpatiSourceService);
//# sourceMappingURL=chaurpati-source.service.js.map