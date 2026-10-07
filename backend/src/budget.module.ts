import { Module } from '@nestjs/common';
import { BudgetController, AdminBudgetController } from './budget.controller';
import { BudgetService } from './budget.service';

@Module({ controllers: [BudgetController, AdminBudgetController], providers: [BudgetService] })
export class BudgetModule {}
