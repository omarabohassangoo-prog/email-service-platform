/**
 * @file logger.ts
 * @description Safe logger implementation with automatic credential sanitization and masking.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'none';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
  none: 5,
};

/**
 * Redacts secret keys, bearer tokens, and passwords from logs.
 */
export function sanitizeLogData(value: unknown): unknown {
  if (typeof value === 'string') {
    // Redact API Keys: sk_... or pk_... or long hex/base64 tokens
    return value
      .replace(/([sSpP]k_[a-zA-Z0-9_-]{4})[a-zA-Z0-9_-]+/g, '$1***[REDACTED]')
      .replace(/(bearer\s+)[a-zA-Z0-9._-]+/gi, '$1***[REDACTED]')
      .replace(/(password['"]?\s*[:=]\s*['"]?)[^'"\s,]+/gi, '$1***[REDACTED]');
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeLogData);
  }

  if (value && typeof value === 'object') {
    const copy: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const lowerKey = k.toLowerCase();
      if (
        lowerKey.includes('key') ||
        lowerKey.includes('secret') ||
        lowerKey.includes('password') ||
        lowerKey.includes('token') ||
        lowerKey.includes('auth')
      ) {
        copy[k] = '***[REDACTED]';
      } else {
        copy[k] = sanitizeLogData(v);
      }
    }
    return copy;
  }

  return value;
}

export class Logger {
  private levelValue: number;

  constructor(level: LogLevel = 'info') {
    this.levelValue = LOG_LEVELS[level] ?? LOG_LEVELS.info;
  }

  public setLevel(level: LogLevel): void {
    this.levelValue = LOG_LEVELS[level] ?? LOG_LEVELS.info;
  }

  public debug(message: string, ...args: unknown[]): void {
    if (this.levelValue <= LOG_LEVELS.debug) {
      console.debug(`[@email-service/sdk] [DEBUG] ${message}`, ...args.map(sanitizeLogData));
    }
  }

  public info(message: string, ...args: unknown[]): void {
    if (this.levelValue <= LOG_LEVELS.info) {
      console.info(`[@email-service/sdk] [INFO] ${message}`, ...args.map(sanitizeLogData));
    }
  }

  public warn(message: string, ...args: unknown[]): void {
    if (this.levelValue <= LOG_LEVELS.warn) {
      console.warn(`[@email-service/sdk] [WARN] ${message}`, ...args.map(sanitizeLogData));
    }
  }

  public error(message: string, ...args: unknown[]): void {
    if (this.levelValue <= LOG_LEVELS.error) {
      console.error(`[@email-service/sdk] [ERROR] ${message}`, ...args.map(sanitizeLogData));
    }
  }
}
