/**
 * @file index.ts
 * @description Main entry point for the @email-service/sdk package.
 */

// Export Primary Client
export { EmailService } from './client.js';

// Export Error Classes
export {
  EmailServiceError,
  AuthenticationError,
  ValidationError,
  EmailSendError,
  RateLimitError,
  NotFoundError,
  TimeoutError,
} from './errors.js';

// Export All Interfaces & Types
export type {
  EmailServiceConfig,
  EmailAttachment,
  SendEmailOptions,
  SendEmailResult,
  EmailStatus,
  BulkSendOptions,
  BulkEmailResult,
  ScheduleEmailOptions,
  ScheduleEmailResult,
  ScheduleInfo,
  ScheduleList,
  Template,
  TemplateList,
  CreateTemplateOptions,
  RenderTemplateResult,
  ServiceStats,
  HealthStatus,
  SDKTestResult,
  ConnectionTest,
} from './types.js';

// Export Validation Helpers
export {
  isValidEmail,
  normalizeAndValidateEmails,
  validateSendEmailOptions,
  validateScheduleEmailOptions,
  validateCreateTemplateOptions,
} from './utils/validator.js';

// Export Logger & Utilities
export { Logger, sanitizeLogData } from './utils/logger.js';
export type { LogLevel } from './utils/logger.js';
export { HttpClient } from './utils/http.js';
export type { HttpRequestOptions } from './utils/http.js';
