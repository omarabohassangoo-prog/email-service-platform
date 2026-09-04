import { dbStore } from '../server/db';
import { ApiKey } from '../types';
import { auditService } from './audit.service';

export class ApiKeyService {
  /**
   * Retrieves all API keys.
   */
  async getApiKeys(): Promise<ApiKey[]> {
    return dbStore.getApiKeys();
  }

  /**
   * Generates a new API key with specified scopes and limits.
   */
  async createApiKey(dto: {
    name: string;
    permissions: {
      send_email: boolean;
      bulk_email: boolean;
      manage_templates: boolean;
      view_analytics: boolean;
    };
    rate_limit?: number;
    daily_limit?: number;
  }): Promise<ApiKey> {
    const rawKey = `esp_live_${Math.random().toString(36).substring(2, 15)}_${Date.now().toString(36)}`;
    const newKey: ApiKey = {
      id: `key-${Date.now()}`,
      admin_user_id: 'admin-001',
      key: rawKey,
      name: dto.name,
      permissions: dto.permissions,
      rate_limit: dto.rate_limit || 1000,
      daily_limit: dto.daily_limit || 10000,
      daily_used: 0,
      is_active: true,
      created_at: new Date().toISOString()
    };

    const keys = dbStore.getApiKeys();
    keys.unshift(newKey);

    await auditService.log({
      action: 'api_key.create',
      details: { key_id: newKey.id, name: newKey.name, permissions: newKey.permissions }
    });

    return newKey;
  }

  /**
   * Updates an existing API key's parameters (metadata/permissions/limits).
   */
  async updateApiKey(id: string, updates: Partial<ApiKey>): Promise<ApiKey | null> {
    const keys = dbStore.getApiKeys();
    const key = keys.find(k => k.id === id);
    if (!key) return null;

    if (updates.name !== undefined) key.name = updates.name;
    if (updates.permissions !== undefined) key.permissions = { ...key.permissions, ...updates.permissions };
    if (updates.rate_limit !== undefined) key.rate_limit = updates.rate_limit;
    if (updates.daily_limit !== undefined) key.daily_limit = updates.daily_limit;
    if (updates.is_active !== undefined) key.is_active = updates.is_active;

    await auditService.log({
      action: 'api_key.update',
      details: { key_id: id, updates }
    });

    return key;
  }

  /**
   * Revokes (deactivates or deletes) an API key.
   */
  async revokeApiKey(id: string): Promise<boolean> {
    const keys = dbStore.getApiKeys();
    const key = keys.find(k => k.id === id);
    if (!key) return false;

    key.is_active = false;

    await auditService.log({
      action: 'api_key.revoke',
      details: { key_id: id, name: key.name }
    });

    return true;
  }

  /**
   * Validates an API key and optionally verifies a required permission/scope.
   */
  async validateApiKey(
    rawKey: string,
    requiredScope?: 'send_email' | 'bulk_email' | 'manage_templates' | 'view_analytics'
  ): Promise<{ isValid: boolean; error?: string; apiKey?: ApiKey }> {
    const keys = dbStore.getApiKeys();
    const keyObj = keys.find(k => k.key === rawKey);

    if (!keyObj) {
      return { isValid: false, error: 'مفتاح API غير صالح' };
    }

    if (!keyObj.is_active) {
      return { isValid: false, error: 'مفتاح API ملغى أو غير نشط' };
    }

    // Check scope if requested
    if (requiredScope && !keyObj.permissions[requiredScope]) {
      return {
        isValid: false,
        error: `مفتاح API لا يمتلك الصلاحيات الكافية لتنفيذ هذا الإجراء (${requiredScope})`
      };
    }

    // Check daily rate limit
    if (keyObj.daily_used >= keyObj.daily_limit) {
      return { isValid: false, error: 'تم تجاوز الحد اليومي المسموح به لهذا المفتاح' };
    }

    // Increment usage
    keyObj.daily_used += 1;
    keyObj.last_used = new Date().toISOString();

    return { isValid: true, apiKey: keyObj };
  }
}

export const apiKeyService = new ApiKeyService();
