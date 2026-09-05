import { describe, it, expect } from 'vitest';
import {
  EmailServiceError,
  AuthenticationError,
  ValidationError,
  EmailSendError,
  RateLimitError,
  NotFoundError,
  TimeoutError,
} from '../src/errors.js';

describe('SDK Custom Error Classes', () => {
  it('should instantiate EmailServiceError with defaults and correct prototype chain', () => {
    const error = new EmailServiceError('Base error');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(EmailServiceError);
    expect(error.name).toBe('EmailServiceError');
    expect(error.code).toBe('EMAIL_SERVICE_ERROR');
    expect(error.timestamp).toBeDefined();
    expect(error.toJSON()).toHaveProperty('code', 'EMAIL_SERVICE_ERROR');
  });

  it('should handle AuthenticationError (401)', () => {
    const error = new AuthenticationError('Invalid API Key');
    expect(error).toBeInstanceOf(AuthenticationError);
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe('AUTHENTICATION_ERROR');
  });

  it('should handle ValidationError (400) with details', () => {
    const details = { field: 'to', error: 'Invalid email' };
    const error = new ValidationError('Bad request', details);
    expect(error).toBeInstanceOf(ValidationError);
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.details).toEqual(details);
  });

  it('should handle EmailSendError (500)', () => {
    const error = new EmailSendError('SMTP connection refused', 503);
    expect(error).toBeInstanceOf(EmailSendError);
    expect(error.statusCode).toBe(503);
    expect(error.code).toBe('EMAIL_SEND_ERROR');
  });

  it('should handle RateLimitError (429) with retryAfterSeconds', () => {
    const error = new RateLimitError('Limit exceeded', 60);
    expect(error).toBeInstanceOf(RateLimitError);
    expect(error.statusCode).toBe(429);
    expect(error.code).toBe('RATE_LIMIT_EXCEEDED');
    expect(error.retryAfterSeconds).toBe(60);
  });

  it('should handle NotFoundError (404)', () => {
    const error = new NotFoundError('Template not found');
    expect(error).toBeInstanceOf(NotFoundError);
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('NOT_FOUND');
  });

  it('should handle TimeoutError (408)', () => {
    const error = new TimeoutError('Request exceeded 5000ms', 5000);
    expect(error).toBeInstanceOf(TimeoutError);
    expect(error.statusCode).toBe(408);
    expect(error.code).toBe('REQUEST_TIMEOUT');
  });
});
