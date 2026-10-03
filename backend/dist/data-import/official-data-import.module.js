"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfficialDataImportModule = void 0;
const common_1 = require("@nestjs/common");
const official_data_import_controller_1 = require("./official-data-import.controller");
const official_data_import_service_1 = require("./official-data-import.service");
const chaurpati_source_service_1 = require("./official/chaurpati/chaurpati-source.service");
let OfficialDataImportModule = class OfficialDataImportModule {
};
exports.OfficialDataImportModule = OfficialDataImportModule;
exports.OfficialDataImportModule = OfficialDataImportModule = __decorate([
    (0, common_1.Module)({
        controllers: [official_data_import_controller_1.OfficialDataImportController],
        providers: [official_data_import_service_1.OfficialDataImportService, chaurpati_source_service_1.ChaurpatiSourceService],
        exports: [official_data_import_service_1.OfficialDataImportService],
    })
], OfficialDataImportModule);
//# sourceMappingURL=official-data-import.module.js.map