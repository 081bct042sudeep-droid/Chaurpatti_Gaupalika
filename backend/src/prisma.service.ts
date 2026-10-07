import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient as SqlitePrismaClient } from '../node_modules/.prisma/portal-sqlite-client';
import { PrismaClient as PostgresPrismaClient } from '../node_modules/.prisma/portal-postgres-client';

const PrismaBase = (process.env.DATABASE_URL?.startsWith('postgres')
  ? PostgresPrismaClient
  : SqlitePrismaClient) as unknown as typeof PostgresPrismaClient;

@Injectable()
export class PrismaService extends PrismaBase implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({ datasources: { db: { url: process.env.DATABASE_URL ?? 'file:../dev.db' } } });
  }

  async onModuleInit() { await this.$connect(); }
  async onModuleDestroy() { await this.$disconnect(); }
}
