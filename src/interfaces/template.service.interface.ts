/**
 * Interface definition for Email Template Service
 * Manages Handlebars templates, variable validation, rendering, and caching.
 */

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required: boolean;
  defaultValue?: any;
}

export interface CreateTemplateDto {
  name: string;
  description?: string;
  scope?: 'app' | 'system' | 'global';
  appId?: string;
  appName?: string;
  subject: string;
  html: string;
  text?: string;
  variables: TemplateVariable[];
  category?: string;
}

export interface RenderTemplateResult {
  renderedSubject: string;
  renderedHtml: string;
  renderedText?: string;
  missingVariables?: string[];
}

export interface ITemplateService {
  /**
   * Compiles Handlebars template with dynamic variables and renders HTML/Text content
   */
  renderTemplate(templateNameOrId: string, data: Record<string, any>): Promise<RenderTemplateResult>;

  /**
   * Creates or updates a template definition, validating Handlebars syntax
   */
  saveTemplate(dto: CreateTemplateDto, adminUserId?: string): Promise<{ id: string; version: number }>;

  /**
   * Retrieves template details by name or UUID, utilizing Redis cache
   */
  getTemplate(identifier: string): Promise<CreateTemplateDto & { id: string; version: number }>;

  /**
   * Validates required data variables against template requirements before dispatch
   */
  validateTemplateData(templateNameOrId: string, data: Record<string, any>): Promise<{ isValid: boolean; missingKeys: string[] }>;

  /**
   * Lists available email templates filtered by scope or category
   */
  listTemplates(filter?: { category?: string; scope?: string }): Promise<Array<CreateTemplateDto & { id: string }>>;
}
