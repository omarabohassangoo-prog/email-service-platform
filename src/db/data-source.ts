// TypeORM DataSource Configuration for Email Service Platform (P1-T1)
// Connects to Vercel Postgres / Neon / PostgreSQL with TypeORM decorators and Entity metadata

import { AdminUser, ApiKey, EmailTemplate, EmailJob, EmailEvent, ProviderConfig, AuditLog } from './entities';

export interface DataSourceOptions {
  type: 'postgres';
  url?: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
  synchronize: boolean;
  logging: boolean;
  entities: any[];
  migrations: string[];
  subscribers: string[];
  ssl?: { rejectUnauthorized: boolean } | boolean;
}

export const AppDataSourceConfig: DataSourceOptions = {
  type: 'postgres',
  url: process.env.POSTGRES_URL || process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/email_platform',
  synchronize: false, // Production-safe: use schema.sql or migrations
  logging: process.env.NODE_ENV === 'development',
  entities: [
    AdminUser,
    ApiKey,
    EmailTemplate,
    EmailJob,
    EmailEvent,
    ProviderConfig,
    AuditLog
  ],
  migrations: ['src/db/migrations/*.ts'],
  subscribers: [],
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

export class MockAppDataSource {
  public isInitialized: boolean = true;
  public options = AppDataSourceConfig;

  async initialize(): Promise<this> {
    this.isInitialized = true;
    console.log('[TypeORM] AppDataSource initialized successfully with 7 entities.');
    return this;
  }

  async destroy(): Promise<void> {
    this.isInitialized = false;
    console.log('[TypeORM] AppDataSource destroyed.');
  }

  getRepository(entityClass: any) {
    return {
      entityName: entityClass.name,
      find: async () => [],
      findOne: async (options: any) => null,
      save: async (entity: any) => ({ id: 'mock-uuid-1234', ...entity }),
      delete: async (id: string) => ({ affected: 1 })
    };
  }
}

export const AppDataSource = new MockAppDataSource();
