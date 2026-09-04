/**
 * Dependency Injection Container for Email Service Platform (P1-T2)
 * Manages singleton service instances and dependency wiring.
 */

import { CacheService } from './cache.service';
import { AuthService } from './auth.service';
import { ApiKeyService, apiKeyService } from './api-key.service';
import { AuditService, auditService } from './audit.service';
import { QueueService } from './queue.service';
import { ProviderService } from './provider.service';
import { TemplateService } from './template.service';
import { EmailService } from './email.service';
import { SchedulingService } from './scheduling.service';
import { AnalyticsService } from './analytics.service';
import { HealthService } from './health.service';

import { IAuthService } from '../interfaces/auth.service.interface';
import { IQueueService } from '../interfaces/queue.service.interface';
import { IProviderService } from '../interfaces/provider.service.interface';
import { ITemplateService } from '../interfaces/template.service.interface';
import { IEmailService } from '../interfaces/email.service.interface';
import { ISchedulingService } from '../interfaces/scheduling.service.interface';
import { IAnalyticsService } from '../interfaces/analytics.service.interface';
import { IHealthService } from '../interfaces/health.service.interface';

export class ServiceContainer {
  private static instance: ServiceContainer;

  public cacheService: CacheService;
  public authService: AuthService; // use concrete type to access lock & direct methods
  public apiKeyService: ApiKeyService;
  public auditService: AuditService;
  public queueService: IQueueService;
  public providerService: IProviderService;
  public templateService: ITemplateService;
  public emailService: IEmailService;
  public schedulingService: ISchedulingService;
  public analyticsService: IAnalyticsService;
  public healthService: IHealthService;

  private constructor() {
    // 1. Core Base Infrastructure
    this.cacheService = new CacheService();
    this.apiKeyService = apiKeyService;
    this.auditService = auditService;

    // 2. Specialized Domain Services (Injecting CacheService)
    this.authService = new AuthService(this.cacheService);
    this.queueService = new QueueService();
    this.providerService = new ProviderService(this.cacheService);
    this.templateService = new TemplateService(this.cacheService);
    this.schedulingService = new SchedulingService();
    this.analyticsService = new AnalyticsService();
    this.healthService = new HealthService();

    // 3. High-level Orchestrator (Injecting AuthService, QueueService, ProviderService, TemplateService)
    this.emailService = new EmailService(
      this.authService,
      this.queueService,
      this.providerService,
      this.templateService
    );
  }

  public static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }
}

export const container = ServiceContainer.getInstance();
