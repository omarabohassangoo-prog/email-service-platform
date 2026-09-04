import { Request, Response, NextFunction } from 'express';
import { container } from '../services/container';
import { auditService } from '../services/audit.service';
import { dbStore } from '../server/db';

export interface AuthenticatedRequest extends Request {
  apiKeyData?: any;
  adminUser?: any;
}

/**
 * Express Middleware for API Key verification and authorization
 */
export const authenticateApiKey = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const rawApiKey = 
      (req.headers['x-api-key'] as string) || 
      (req.headers['authorization']?.replace('Bearer ', '') as string) ||
      (req.query.api_key as string);

    // If an Admin Bearer token is provided, we can bypass the API key requirements
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token && (token.startsWith('esp_jwt_access_') || token.startsWith('admin-token-'))) {
        const isUserValid = await container.authService.verifyAccessToken(token);
        if (isUserValid) {
          req.adminUser = { id: 'admin-001', username: 'admin', role: 'superadmin' };
          return next();
        }
      }
    }

    if (!rawApiKey) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'مطلوب مفتاح API صالح لاستخدام هذه الخدمة (X-API-Key)'
      });
      return;
    }

    const validation = await container.authService.validateApiKey(rawApiKey);

    if (!validation.isValid) {
      await auditService.log({
        action: 'api_key.validation_failed',
        details: { key: rawApiKey.substring(0, 15) + '...', reason: validation.error }
      });
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: `مفتاح API غير صالح أو منتهي: ${validation.error || 'يرجى مراجعة الصلاحيات'}`
      });
      return;
    }

    // Attach validated credentials
    req.apiKeyData = validation;
    (req as any).apiKey = dbStore.getApiKeyByKey(rawApiKey);
    next();
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: 'Authentication Error',
      message: err.message
    });
  }
};

/**
 * Middleware for Admin JWT Token Validation (protects admin dashboards & configuration)
 */
export const authenticateAdminJwt = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'مطلوب رمز الوصول للمسؤول (JWT Bearer Token)'
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    const isTokenValid = await container.authService.verifyAccessToken(token);

    if (!isTokenValid) {
      await auditService.log({
        action: 'admin.jwt_failed',
        details: { reason: 'Expired or invalid admin access token' }
      });
      res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'رمز الوصول غير صالح أو منتهي الصلاحية'
      });
      return;
    }

    req.adminUser = { id: 'admin-001', username: 'admin', role: 'superadmin' };
    next();
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: 'Admin JWT Authorization Error',
      message: err.message
    });
  }
};

/**
 * Middleware factory to restrict API keys based on permission scopes
 */
export const requireApiKeyScope = (scope: 'send_email' | 'bulk_email' | 'manage_templates' | 'view_analytics') => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    // Admin access bypasses scopes
    if (req.adminUser) {
      return next();
    }

    const permissions = req.apiKeyData?.permissions || [];
    const mappedScope = 
      scope === 'send_email' ? 'send_email' :
      scope === 'bulk_email' ? 'bulk_email' :
      scope === 'manage_templates' ? 'manage_templates' : 'view_analytics';

    if (!permissions.includes(mappedScope)) {
      await auditService.log({
        action: 'api_key.scope_denied',
        details: { key_id: req.apiKeyData?.apiKeyId, required_scope: scope }
      });
      res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: `مفتاح الـ API المستخدم لا يمتلك الصلاحية المطلوبة للقيام بهذا الإجراء (${scope})`
      });
      return;
    }

    next();
  };
};
