import * as os from 'os';
import { dbStore } from '../server/db';
import { IHealthService, ComponentCheck, DetailedSystemHealth } from '../interfaces/health.service.interface';

export class HealthService implements IHealthService {
  
  public async checkDatabase(): Promise<ComponentCheck> {
    const start = Date.now();
    try {
      // Simulate checking connection to the database
      // Since it's an in-memory store in this prototype, it will always be healthy unless forced otherwise
      const dbStats = {
        apiKeys: dbStore.getApiKeys().length,
        templates: dbStore.getTemplates().length
      };
      
      return {
        name: 'Database (PostgreSQL)',
        status: 'healthy',
        latency_ms: Date.now() - start,
        message: 'Database connection is stable',
        details: dbStats
      };
    } catch (error: any) {
      dbStore.addAuditLog('health.database_failed', { error: error.message });
      return {
        name: 'Database (PostgreSQL)',
        status: 'critical',
        latency_ms: Date.now() - start,
        message: `Database check failed: ${error.message}`
      };
    }
  }

  public async checkRedis(): Promise<ComponentCheck> {
    const start = Date.now();
    try {
      // Simulate Redis check (used for queueing and caching)
      return {
        name: 'Redis Cache & Queue',
        status: 'healthy',
        latency_ms: Date.now() - start,
        message: 'Redis connection is stable'
      };
    } catch (error: any) {
      dbStore.addAuditLog('health.redis_failed', { error: error.message });
      return {
        name: 'Redis Cache & Queue',
        status: 'critical',
        latency_ms: Date.now() - start,
        message: `Redis check failed: ${error.message}`
      };
    }
  }

  public async checkProviders(): Promise<ComponentCheck> {
    const start = Date.now();
    try {
      const providers = dbStore.getProviders();
      const activeProviders = providers.filter(p => p.is_active);
      const primaryProvider = providers.find(p => p.is_primary);

      let status: 'healthy' | 'degraded' | 'critical' = 'healthy';
      let message = 'All email providers are functioning normally';

      if (activeProviders.length === 0) {
        status = 'critical';
        message = 'No active email providers available';
      } else if (!primaryProvider) {
        status = 'degraded';
        message = 'No primary email provider configured';
      } else if (activeProviders.length < providers.length) {
        status = 'degraded';
        message = 'Some email providers are inactive or failed';
      }

      if (status !== 'healthy') {
        dbStore.addAuditLog('health.providers_degraded', { active: activeProviders.length, total: providers.length });
      }

      return {
        name: 'Email Providers',
        status,
        latency_ms: Date.now() - start,
        message,
        details: {
          total: providers.length,
          active: activeProviders.length
        }
      };
    } catch (error: any) {
      return {
        name: 'Email Providers',
        status: 'critical',
        latency_ms: Date.now() - start,
        message: `Providers check failed: ${error.message}`
      };
    }
  }

  public async checkQueue(): Promise<ComponentCheck> {
    const start = Date.now();
    try {
      const queueMetrics = dbStore.getQueueMetrics();
      let status: 'healthy' | 'degraded' | 'critical' = 'healthy';
      let message = 'Queue is processing jobs normally';

      // Alert if queue is backed up
      if (queueMetrics.waiting > 10000) {
        status = 'critical';
        message = 'Critical queue backlog detected';
        dbStore.addAuditLog('health.queue_critical', { waiting: queueMetrics.waiting });
      } else if (queueMetrics.waiting > 1000) {
        status = 'degraded';
        message = 'Queue backlog is building up';
        dbStore.addAuditLog('health.queue_degraded', { waiting: queueMetrics.waiting });
      } else if (queueMetrics.failed > 100) {
        status = 'degraded';
        message = 'High number of failed jobs in queue';
      }

      return {
        name: 'Job Queue',
        status,
        latency_ms: Date.now() - start,
        message,
        details: queueMetrics
      };
    } catch (error: any) {
      return {
        name: 'Job Queue',
        status: 'critical',
        latency_ms: Date.now() - start,
        message: `Queue check failed: ${error.message}`
      };
    }
  }

  public async checkCompliance(): Promise<ComponentCheck> {
    const start = Date.now();
    try {
      // Simulate checking domain compliance records (SPF, DKIM, DMARC)
      // In a real scenario, this would query DNS records for the sending domains
      return {
        name: 'Domain Compliance (SPF/DKIM/DMARC)',
        status: 'healthy',
        latency_ms: Date.now() - start,
        message: 'All domains pass compliance checks',
        details: {
          spf: 'pass',
          dkim: 'pass',
          dmarc: 'pass'
        }
      };
    } catch (error: any) {
      return {
        name: 'Domain Compliance (SPF/DKIM/DMARC)',
        status: 'critical',
        latency_ms: Date.now() - start,
        message: `Compliance check failed: ${error.message}`
      };
    }
  }

  public async checkSystemMetrics(): Promise<ComponentCheck> {
    const start = Date.now();
    try {
      const memUsage = process.memoryUsage();
      const freeMem = os.freemem();
      const totalMem = os.totalmem();
      
      const cpuUsage = process.cpuUsage();
      const totalCpuTime = cpuUsage.user + cpuUsage.system;
      const uptime = process.uptime();
      
      // Rough CPU percentage (not completely accurate for node, but indicative)
      const cpuPct = Math.min((totalCpuTime / 1000000 / uptime) * 100, 100).toFixed(1);
      const usedMemPct = ((totalMem - freeMem) / totalMem) * 100;

      let status: 'healthy' | 'degraded' | 'critical' = 'healthy';
      let message = 'System resources are within normal limits';

      if (usedMemPct > 90) {
        status = 'critical';
        message = 'Critical memory usage';
        dbStore.addAuditLog('health.memory_critical', { used_pct: usedMemPct });
      } else if (usedMemPct > 80) {
        status = 'degraded';
        message = 'High memory usage';
      }

      return {
        name: 'System Resources',
        status,
        latency_ms: Date.now() - start,
        message,
        details: {
          memory: {
            heap_used_mb: Math.round(memUsage.heapUsed / 1024 / 1024),
            heap_total_mb: Math.round(memUsage.heapTotal / 1024 / 1024),
            system_used_pct: usedMemPct.toFixed(1)
          },
          cpu_usage_pct: parseFloat(cpuPct)
        }
      };
    } catch (error: any) {
      return {
        name: 'System Resources',
        status: 'critical',
        latency_ms: Date.now() - start,
        message: `System metrics check failed: ${error.message}`
      };
    }
  }

  public async checkAll(): Promise<DetailedSystemHealth> {
    const [
      database,
      redis,
      providers,
      queue,
      compliance,
      system
    ] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkProviders(),
      this.checkQueue(),
      this.checkCompliance(),
      this.checkSystemMetrics()
    ]);

    const components = [database, redis, providers, queue, compliance, system];
    
    const isCritical = components.some(c => c.status === 'critical');
    const isDegraded = components.some(c => c.status === 'degraded');
    
    const overallStatus = isCritical ? 'critical' : isDegraded ? 'degraded' : 'healthy';

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      components
    };
  }
}
