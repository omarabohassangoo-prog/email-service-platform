/**
 * @file validator.ts
 * @description Input validation utilities for SDK operations.
 */

import { ValidationError } from '../errors.js';
import type { SendEmailOptions, ScheduleEmailOptions, CreateTemplateOptions } from '../types.js';

/**
 * Standard RFC 5322 compliant simplified email regex.
 */
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * Validates a single email address format.
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email.trim());
}

/**
 * Normalizes string or array of emails into a validated array.
 */
export function normalizeAndValidateEmails(input: string | string[], fieldName = 'recipient'): string[] {
  if (!input) {
    throw new ValidationError(`Field '${fieldName}' is required.`);
  }

  const list = Array.isArray(input) ? input : [input];
  if (list.length === 0) {
    throw new ValidationError(`Field '${fieldName}' cannot be an empty array.`);
  }

  const validated: string[] = [];
  const errors: string[] = [];

  for (const item of list) {
    if (typeof item !== 'string' || !isValidEmail(item)) {
      errors.push(`Invalid email address in '${fieldName}': '${item}'`);
    } else {
      validated.push(item.trim().toLowerCase());
    }
  }

  if (errors.length > 0) {
    throw new ValidationError(`Validation failed for '${fieldName}': ${errors.join(', ')}`, { errors });
  }

  return validated;
}

/**
 * Validates options passed to sendEmail.
 */
export function validateSendEmailOptions(options: SendEmailOptions): void {
  if (!options || typeof options !== 'object') {
    throw new ValidationError('Options must be an object.');
  }

  // Validate 'to'
  normalizeAndValidateEmails(options.to, 'to');

  // Validate optional 'cc'
  if (options.cc) {
    normalizeAndValidateEmails(options.cc, 'cc');
  }

  // Validate optional 'bcc'
  if (options.bcc) {
    normalizeAndValidateEmails(options.bcc, 'bcc');
  }

  // Subject is required
  if (!options.subject || typeof options.subject !== 'string' || options.subject.trim().length === 0) {
    throw new ValidationError("Field 'subject' is required and must be a non-empty string.");
  }

  // Either html, text, or templateId must be supplied
  const hasHtml = typeof options.html === 'string' && options.html.trim().length > 0;
  const hasText = typeof options.text === 'string' && options.text.trim().length > 0;
  const hasTemplate = typeof options.templateId === 'string' && options.templateId.trim().length > 0;

  if (!hasHtml && !hasText && !hasTemplate) {
    throw new ValidationError("At least one of 'html', 'text', or 'templateId' must be provided.");
  }

  // Validate priority if given
  if (options.priority && !['high', 'normal', 'low'].includes(options.priority)) {
    throw new ValidationError("Field 'priority' must be one of: 'high', 'normal', 'low'.");
  }

  // Validate attachments if given
  if (options.attachments) {
    if (!Array.isArray(options.attachments)) {
      throw new ValidationError("Field 'attachments' must be an array.");
    }
    for (let i = 0; i < options.attachments.length; i++) {
      const att = options.attachments[i];
      if (!att || typeof att !== 'object') {
        throw new ValidationError(`Attachment at index ${i} is invalid.`);
      }
      if (!att.filename || typeof att.filename !== 'string') {
        throw new ValidationError(`Attachment at index ${i} missing valid 'filename'.`);
      }
      if (!att.content && !att.path) {
        throw new ValidationError(`Attachment '${att.filename}' must provide either 'content' or 'path'.`);
      }
    }
  }
}

/**
 * Validates schedule email options.
 */
export function validateScheduleEmailOptions(options: ScheduleEmailOptions): void {
  validateSendEmailOptions(options);

  if (!options.scheduledAt) {
    throw new ValidationError("Field 'scheduledAt' is required for scheduled emails.");
  }

  const date = options.scheduledAt instanceof Date ? options.scheduledAt : new Date(options.scheduledAt);
  if (isNaN(date.getTime())) {
    throw new ValidationError("Field 'scheduledAt' must be a valid Date object or ISO 8601 string.");
  }

  if (options.recurrence && !['daily', 'weekly', 'monthly'].includes(options.recurrence)) {
    throw new ValidationError("Field 'recurrence' must be one of: 'daily', 'weekly', 'monthly' or null.");
  }
}

/**
 * Validates template creation parameters.
 */
export function validateCreateTemplateOptions(options: CreateTemplateOptions): void {
  if (!options || typeof options !== 'object') {
    throw new ValidationError('Template options must be an object.');
  }

  if (!options.name || typeof options.name !== 'string' || options.name.trim().length === 0) {
    throw new ValidationError("Field 'name' is required for templates.");
  }

  if (!options.scope || !['global', 'app'].includes(options.scope)) {
    throw new ValidationError("Field 'scope' must be either 'global' or 'app'.");
  }

  if (!options.subject || typeof options.subject !== 'string') {
    throw new ValidationError("Field 'subject' is required for templates.");
  }

  if (!options.html || typeof options.html !== 'string') {
    throw new ValidationError("Field 'html' is required for templates.");
  }
}
