/**
 * Interface definition for Authentication and Authorization Service
 * Handles admin JWT authentication, API key validation, password hashing, and rate limiting rules.
 */

export interface AdminLoginDto {
  username: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ApiKeyValidationResult {
  isValid: boolean;
  apiKeyId?: string;
  adminUserId?: string;
  rateLimitRemaining?: number;
  dailyLimitRemaining?: number;
  permissions?: string[];
  error?: string;
}

export interface CreateApiKeyDto {
  adminUserId: string;
  name: string;
  permissions: string[];
  rateLimit?: number;
  dailyLimit?: number;
  expiresInDays?: number;
}

export interface IAuthService {
  /**
   * Authenticates admin credentials and returns JWT access & refresh tokens
   */
  login(credentials: AdminLoginDto): Promise<AuthTokens>;

  /**
   * Validates an API key against Redis cache or database, checking active status and expiration
   */
  validateApiKey(rawApiKey: string): Promise<ApiKeyValidationResult>;

  /**
   * Generates a new cryptographically secure API key for an admin user
   */
  generateApiKey(dto: CreateApiKeyDto): Promise<{ rawKey: string; keyId: string }>;

  /**
   * Revokes or deactivates an API key
   */
  revokeApiKey(keyId: string, adminUserId: string): Promise<boolean>;

  /**
   * Hashes a plain-text password using bcrypt
   */
  hashPassword(password: string): Promise<string>;

  /**
   * Verifies a password against a stored bcrypt hash
   */
  verifyPassword(password: string, hash: string): Promise<boolean>;
}
