export interface ComponentCheck {
  name: string;
  status: 'healthy' | 'degraded' | 'critical';
  latency_ms?: number;
  message?: string;
  details?: Record<string, any>;
}

export interface DetailedSystemHealth {
  status: 'healthy' | 'degraded' | 'critical';
  timestamp: string;
  uptime: number;
  components: ComponentCheck[];
}

export interface IHealthService {
  checkDatabase(): Promise<ComponentCheck>;
  checkRedis(): Promise<ComponentCheck>;
  checkProviders(): Promise<ComponentCheck>;
  checkQueue(): Promise<ComponentCheck>;
  checkCompliance(): Promise<ComponentCheck>;
  checkSystemMetrics(): Promise<ComponentCheck>;
  checkAll(): Promise<DetailedSystemHealth>;
}
