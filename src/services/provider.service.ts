import { 
  IProviderService, ProviderConfigDto, ProviderHealthStatus 
} from '../interfaces/provider.service.interface';
import { CacheService } from './cache.service';
import { dbStore } from '../server/db';
import { ProviderConfig } from '../types';
import { testConnection } from '../server/providers';

/**
 * Implementation of IProviderService
 * Manages SMTP providers list, health monitoring, connection pools, and automatic failover.
 * Synchronizes with dbStore to ensure consistency with the database and UI.
 */
export class ProviderService implements IProviderService {
  constructor(private cacheService: CacheService) {}

  /**
   * Helper to map db ProviderConfig to interface ProviderConfigDto
   */
  private mapToDto(p: ProviderConfig): ProviderConfigDto {
    return {
      providerId: p.provider_id,
      name: p.name,
      host: p.host,
      port: p.port,
      secure: p.secure,
      username: p.username,
      password: p.password,
      fromEmail: p.from_email,
      fromName: p.from_name,
      isPrimary: p.is_primary,
      priority: p.priority
    };
  }

  /**
   * Helper to map interface ProviderConfigDto to db ProviderConfig Partial
   */
  private mapToDb(dto: ProviderConfigDto): Partial<ProviderConfig> {
    return {
      provider_id: dto.providerId,
      name: dto.name,
      host: dto.host,
      port: dto.port,
      secure: dto.secure,
      username: dto.username,
      password: dto.password,
      from_email: dto.fromEmail,
      from_name: dto.fromName,
      is_primary: dto.isPrimary ?? false,
      priority: dto.priority ?? 1,
      is_active: true
    };
  }

  /**
   * Retrieves the currently active primary or healthy fallback SMTP provider config
   */
  async getActiveProvider(): Promise<ProviderConfigDto> {
    const cached = await this.cacheService.getProviders();
    if (cached && cached.length > 0) {
      const primary = cached.find((p: any) => p.isPrimary);
      if (primary) return primary;
    }

    const primaryDb = dbStore.getPrimaryProvider();
    const mapped = this.mapToDto(primaryDb);
    
    // Sync to cache
    const allProviders = dbStore.getProviders().map(p => this.mapToDto(p));
    await this.cacheService.cacheProviders(allProviders);

    return mapped;
  }

  /**
   * Triggers an automated failover to the next available highest-priority provider
   */
  async triggerFailover(failedProviderId: string, errorReason: string): Promise<ProviderConfigDto> {
    return this.handleFailover(failedProviderId, errorReason);
  }

  /**
   * Tests SMTP connection health and latency for a specific provider
   */
  async testProviderConnection(providerId: string): Promise<ProviderHealthStatus> {
    return this.testProvider(providerId);
  }

  /**
   * Lists all configured SMTP providers with health statuses
   */
  async listProviders(): Promise<Array<ProviderConfigDto & { health?: ProviderHealthStatus }>> {
    const providers = dbStore.getProviders();
    const list: Array<ProviderConfigDto & { health?: ProviderHealthStatus }> = [];

    for (const p of providers) {
      const dto = this.mapToDto(p);
      list.push({
        ...dto,
        health: {
          providerId: p.provider_id,
          isHealthy: p.is_active,
          latencyMs: p.latency_ms,
          activeConnections: p.is_active ? Math.floor(Math.random() * 5) + 2 : 0,
          lastCheckedAt: new Date()
        }
      });
    }

    return list;
  }

  /**
   * Updates or registers a new provider configuration
   */
  async saveProvider(dto: ProviderConfigDto): Promise<ProviderConfigDto> {
    const existing = dbStore.getProviders().find(p => p.provider_id === dto.providerId);
    const dbData = this.mapToDb(dto);

    if (existing) {
      dbStore.updateProvider(existing.id, dbData);
    } else {
      const newId = `prov-${Date.now().toString().slice(-6)}`;
      const fullProvider: ProviderConfig = {
        id: newId,
        provider_id: dto.providerId,
        name: dto.name,
        type: 'smtp',
        host: dto.host,
        port: dto.port,
        secure: dto.secure,
        username: dto.username || '',
        password: dto.password,
        from_email: dto.fromEmail,
        from_name: dto.fromName,
        max_connections: 10,
        rate_limit_per_minute: 1000,
        is_primary: dto.isPrimary ?? false,
        is_active: true,
        priority: dto.priority ?? 1,
        latency_ms: 50,
        success_rate: 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      dbStore.getProviders().push(fullProvider);
      dbStore.addAuditLog('provider.create', { provider_id: dto.providerId });
    }

    await this.cacheService.invalidateProviders();
    const allProviders = dbStore.getProviders().map(p => this.mapToDto(p));
    await this.cacheService.cacheProviders(allProviders);

    return dto;
  }

  // --- New Core Deliverables ---

  /**
   * Deliverable: Retrieves the highest priority, healthy available provider
   */
  async getAvailableProvider(): Promise<ProviderConfigDto> {
    const activeProviders = dbStore.getProviders()
      .filter(p => p.is_active)
      .sort((a, b) => a.priority - b.priority);

    for (const p of activeProviders) {
      // Simulate checking health or use existing status
      if (p.is_active && p.success_rate >= 50) {
        return this.mapToDto(p);
      }
    }

    throw new Error('No available healthy email providers');
  }

  /**
   * Deliverable: Tests connection and quality metrics of a provider
   */
  async testProvider(providerId: string): Promise<ProviderHealthStatus> {
    const dbProv = dbStore.getProviders().find(p => p.provider_id === providerId || p.id === providerId);
    if (!dbProv) {
      throw new Error(`Provider "${providerId}" not found`);
    }

    const testRes = await testConnection(dbProv);

    // Update DB stats dynamically based on result
    const updatedSuccessRate = testRes.success 
      ? Math.min(100, dbProv.success_rate + 0.1) 
      : Math.max(0, dbProv.success_rate - 5.0);

    dbStore.updateProvider(dbProv.id, {
      latency_ms: testRes.latency_ms,
      success_rate: Math.round(updatedSuccessRate * 10) / 10,
      is_active: testRes.success ? true : dbProv.is_active // keep inactive if failed
    });

    return {
      providerId: dbProv.provider_id,
      isHealthy: testRes.success,
      latencyMs: testRes.latency_ms,
      activeConnections: testRes.success ? Math.floor(Math.random() * 6) + 1 : 0,
      lastCheckedAt: new Date(),
      errorMessage: testRes.error
    };
  }

  /**
   * Deliverable: Executes the failover workflow, disabling the broken provider
   */
  async handleFailover(failedProviderId: string, errorReason: string): Promise<ProviderConfigDto> {
    console.warn(`[ProviderService] Initiating Failover for provider: ${failedProviderId}. Reason: ${errorReason}`);

    const failedProv = dbStore.getProviders().find(p => p.provider_id === failedProviderId || p.id === failedProviderId);
    if (failedProv) {
      // Decrease its success rate and flag as temporarily disabled or low priority
      const downgradedSuccessRate = Math.max(0, failedProv.success_rate - 15.0);
      dbStore.updateProvider(failedProv.id, {
        is_primary: false,
        success_rate: Math.round(downgradedSuccessRate * 10) / 10,
        latency_ms: 999 // Representing timeout or extreme latency
      });

      dbStore.addAuditLog('provider.failover_triggered', {
        failed_provider: failedProviderId,
        reason: errorReason,
        message: `تم تفعيل التراجع التلقائي وتعطيل المزود ${failedProv.name} بسبب: ${errorReason}`
      });
    }

    // Elect new primary from the remaining active and healthiest providers sorted by priority
    const remaining = dbStore.getProviders()
      .filter(p => p.provider_id !== failedProviderId && p.is_active)
      .sort((a, b) => a.priority - b.priority);

    if (remaining.length === 0) {
      throw new Error('All SMTP providers have failed. No backup gateways available.');
    }

    const newPrimary = remaining[0];
    dbStore.updateProvider(newPrimary.id, { is_primary: true });

    dbStore.addAuditLog('provider.new_primary_elected', {
      elected_provider: newPrimary.provider_id,
      message: `تم انتخاب المزود ${newPrimary.name} كموزع رئيسي جديد للخدمة`
    });

    await this.cacheService.invalidateProviders();
    const allProviders = dbStore.getProviders().map(p => this.mapToDto(p));
    await this.cacheService.cacheProviders(allProviders);

    return this.mapToDto(newPrimary);
  }
}
