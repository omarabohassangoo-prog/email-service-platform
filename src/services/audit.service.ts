import { dbStore } from '../server/db';

export interface AuditLogDto {
  action: string;
  details?: Record<string, any>;
  adminUserId?: string;
  apiKeyId?: string;
  ipAddress?: string;
}

export class AuditService {
  /**
   * Logs a security or operations event to the system audit trail.
   */
  async log(dto: AuditLogDto): Promise<void> {
    const adminId = dto.adminUserId || 'admin-001';
    dbStore.addAuditLog(
      dto.action,
      dto.details || {},
      adminId,
      dto.apiKeyId
    );
  }

  /**
   * Retrieves audit logs for the monitoring dashboard.
   */
  async getLogs(limit = 100): Promise<any[]> {
    return dbStore.getAuditLogs(limit);
  }
}

export const auditService = new AuditService();
