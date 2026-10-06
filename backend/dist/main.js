"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const express_1 = require("express");
const node_path_1 = require("node:path");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, express_1.json)({ limit: '15mb' }));
    app.use((0, express_1.urlencoded)({ extended: true, limit: '15mb' }));
    app.use('/api/uploads/appeals', (0, express_1.static)((0, node_path_1.join)(process.cwd(), 'uploads', 'appeals')));
    app.use('/api/uploads/map', (0, express_1.static)((0, node_path_1.join)(process.cwd(), 'uploads', 'map')));
    app.use('/api/uploads/tourism', (0, express_1.static)((0, node_path_1.join)(process.cwd(), 'uploads', 'tourism')));
    app.use('/api/uploads/notices', (0, express_1.static)((0, node_path_1.join)(process.cwd(), 'uploads', 'notices')));
    app.enableCors({ origin: true });
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({ transform: true, whitelist: true }));
    await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
//# sourceMappingURL=main.js.map