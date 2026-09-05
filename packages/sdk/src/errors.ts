/**
 * @file errors.ts
 * @description Custom exception hierarchy for the Enterprise Email Service SDK.
 */

/**
 * Base error class for all exceptions thrown by the EmailService SDK.
 */
export class EmailServiceError extends Error {
  /**
   * Standard error code identifier.
   */
  public readonly code: string;

  /**
   * HTTP status code if the error originated from an API response.
   */
  public readonly statusCode?: number;

  /**
   * Structured error details or field-level validation issues.
   */
  public readonly details?: unknown;

  /**
   * Timestamp when the error was instantiated.
   */
  public readonly timestamp: string;

  constructor(message: string, code = 'EMAIL_SERVICE_ERROR', statusCode?: number, details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();

    // Restore correct prototype chain in transpiled environments
    Object.setPrototypeOf(this, new.target.prototype);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Returns a safe JSON representation of the error without leaking credentials.
   */
  public toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp
    };
  }
}

/**
 * Thrown when an API request fails due to missing, invalid, or expired API Key credentials (HTTP 401/403).
 */
export class AuthenticationError extends EmailServiceError {
  constructor(message = 'Invalid or expired API Key provided.', details?: unknown) {
    super(message, 'AUTHENTICATION_ERROR', 401, details);
  }
}

/**
 * Thrown when request arguments fail client-side or server-side schema validation (HTTP 400).
 */
export class ValidationError extends EmailServiceError {
  constructor(message = 'Invalid request parameters.', details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }
}

/**
 * Thrown when the ESP server or underlying mail transport provider fails to accept or process an email (HTTP 500/502/503).
 */
export class EmailSendError extends EmailServiceError {
  constructor(message = 'Failed to submit or send email message.', statusCode = 500, details?: unknown) {
    super(message, 'EMAIL_SEND_ERROR', statusCode, details);
  }
}

/**
 * Thrown when API requests exceed the configured rate limit quotas (HTTP 429).
 */
export class RateLimitError extends EmailServiceError {
  /**
   * Recommended number of seconds to wait before retrying.
   */
  public readonly retryAfterSeconds?: number;

  constructor(message = 'Too many requests. Rate limit exceeded.', retryAfterSeconds?: number, details?: unknown) {
    super(message, 'RATE_LIMIT_EXCEEDED', 429, details);
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

/**
 * Thrown when a requested resource (job ID, template ID, schedule ID) cannot be found (HTTP 404).
 */
export class NotFoundError extends EmailServiceError {
  constructor(message = 'Requested resource not found.', details?: unknown) {
    super(message, 'NOT_FOUND', 404, details);
  }
}

/**
 * Thrown when an API request exceeds the configured network timeout threshold.
 */
export class TimeoutError extends EmailServiceError {
  constructor(message = 'Request timed out after waiting for server response.', timeoutMs?: number) {
    super(message, 'REQUEST_TIMEOUT', 408, { timeoutMs });
  }
}
