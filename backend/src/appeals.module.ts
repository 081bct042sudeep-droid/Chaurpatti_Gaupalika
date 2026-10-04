import { Module } from '@nestjs/common';
import { AppealsController } from './appeals.controller';
import { AppealsService } from './appeals.service';
import { AdminApiKeyGuard, AppealsRateLimitGuard, AppealsSecurityService } from './appeals-security';

@Module({
  controllers: [AppealsController],
  providers: [AppealsService, AppealsSecurityService, AppealsRateLimitGuard, AdminApiKeyGuard],
  exports: [AppealsService],
})
export class AppealsModule {}
