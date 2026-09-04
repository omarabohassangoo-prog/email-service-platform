/**
 * Interface definition for Email Provider & Failover Service
 * Manages SMTP configs, health checks, connection pooling, and automatic provider failover.
 */

export interface ProviderConfigDto {
  providerId: string;
  name: string;
  host: string;
  port: number;
  secure: boolean;
  username?: string;
  password?: string;
  fromEmail: string;
  fromName?: string;
  isPrimary?: boolean;
  priority?: number;
}

export interface ProviderHealthStatus {
  providerId: string;
  isHealthy: boolean;
  latencyMs: number;
  activeConnections: number;
  lastCheckedAt: Date;
  errorMessage?: string;
}

export interface IProviderService {
  /**
   * Retrieves the currently active primary or healthy fallback SMTP provider config
   */
  getActiveProvider(): Promise<ProviderConfigDto>;

  /**
   * Triggers an automated failover to the next available highest-priority provider
   */
  triggerFailover(failedProviderId: string, errorReason: string): Promise<ProviderConfigDto>;

  /**
   * Tests SMTP connection health and latency for a specific provider
   */
  testProviderConnection(providerId: string): Promise<ProviderHealthStatus>;

  /**
   * Lists all configured SMTP providers with health statuses
   */
  listProviders(): Promise<Array<ProviderConfigDto & { health?: ProviderHealthStatus }>>;

  /**
   * Updates or registers a new provider configuration
   */
  saveProvider(dto: ProviderConfigDto): Promise<ProviderConfigDto>;

  /**
   * Deliverable: Retrieves the highest priority, healthy available provider
   */
  getAvailableProvider(): Promise<ProviderConfigDto>;

  /**
   * Deliverable: Tests connection and quality metrics of a provider
   */
  testProvider(providerId: string): Promise<ProviderHealthStatus>;

  /**
   * Deliverable: Executes the failover workflow, disabling the broken provider
   */
  handleFailover(failedProviderId: string, errorReason: string): Promise<ProviderConfigDto>;
}
