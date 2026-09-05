import { describe, it, expect } from 'vitest';
import {
  isValidEmail,
  normalizeAndValidateEmails,
  validateSendEmailOptions,
  validateScheduleEmailOptions,
  validateCreateTemplateOptions,
} from '../src/utils/validator.js';
import { ValidationError } from '../src/errors.js';
import type { SendEmailOptions, EmailAttachment } from '../src/types.js';

describe('SDK Types & Validator Logic', () => {
  describe('isValidEmail', () => {
    it('should validate valid email addresses', () => {
      expect(isValidEmail('omar@example.com')).toBe(true);
      expect(isValidEmail('developer.team+testing@subdomain.domain.co')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('omar@')).toBe(false);
    });
  });

  describe('normalizeAndValidateEmails', () => {
    it('should accept single email string and return array', () => {
      const res = normalizeAndValidateEmails('User@Domain.COM');
      expect(res).toEqual(['user@domain.com']);
    });

    it('should accept array of emails', () => {
      const res = normalizeAndValidateEmails(['a@b.com', 'c@d.com']);
      expect(res).toEqual(['a@b.com', 'c@d.com']);
    });

    it('should throw ValidationError on bad email in list', () => {
      expect(() => normalizeAndValidateEmails(['valid@test.com', 'bad_email'])).toThrow(ValidationError);
    });
  });

  describe('validateSendEmailOptions', () => {
    it('should validate correct SendEmailOptions', () => {
      const opts: SendEmailOptions = {
        to: 'receiver@company.com',
        subject: 'Weekly Report',
        html: '<p>Report details</p>',
        priority: 'high',
      };
      expect(() => validateSendEmailOptions(opts)).not.toThrow();
    });

    it('should throw error when missing subject', () => {
      const opts = {
        to: 'receiver@company.com',
        subject: '',
        html: '<p>Content</p>',
      };
      expect(() => validateSendEmailOptions(opts as unknown as SendEmailOptions)).toThrow(ValidationError);
    });

    it('should throw error when missing html, text, and templateId', () => {
      const opts = {
        to: 'receiver@company.com',
        subject: 'Subject',
      };
      expect(() => validateSendEmailOptions(opts as unknown as SendEmailOptions)).toThrow(ValidationError);
    });

    it('should validate attachment options', () => {
      const validAttachment: EmailAttachment = {
        filename: 'data.json',
        content: '{"ok":true}',
      };
      const opts: SendEmailOptions = {
        to: 'receiver@company.com',
        subject: 'Data',
        text: 'See attached',
        attachments: [validAttachment],
      };
      expect(() => validateSendEmailOptions(opts)).not.toThrow();
    });
  });

  describe('validateScheduleEmailOptions', () => {
    it('should pass on valid schedule timestamp', () => {
      expect(() =>
        validateScheduleEmailOptions({
          to: 'a@b.com',
          subject: 'Scheduled',
          html: '<h1>Hi</h1>',
          scheduledAt: new Date(Date.now() + 3600000),
          recurrence: 'daily',
        })
      ).not.toThrow();
    });

    it('should fail on invalid date string', () => {
      expect(() =>
        validateScheduleEmailOptions({
          to: 'a@b.com',
          subject: 'Scheduled',
          html: '<h1>Hi</h1>',
          scheduledAt: 'not-a-valid-date',
        })
      ).toThrow(ValidationError);
    });
  });

  describe('validateCreateTemplateOptions', () => {
    it('should pass on valid template options', () => {
      expect(() =>
        validateCreateTemplateOptions({
          name: 'Welcome Template',
          scope: 'global',
          subject: 'Welcome {{name}}',
          html: '<h1>Welcome {{name}}</h1>',
        })
      ).not.toThrow();
    });

    it('should fail on invalid scope', () => {
      expect(() =>
        validateCreateTemplateOptions({
          name: 'Invalid Scope',
          scope: 'other' as unknown as 'global',
          subject: 'Subject',
          html: 'Body',
        })
      ).toThrow(ValidationError);
    });
  });
});
