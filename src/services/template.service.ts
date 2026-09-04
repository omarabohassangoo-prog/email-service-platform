import { 
  ITemplateService, CreateTemplateDto, RenderTemplateResult, TemplateVariable 
} from '../interfaces/template.service.interface';
import { CacheService } from './cache.service';
import { dbStore } from '../server/db';
import { EmailTemplate } from '../types';
import Handlebars from 'handlebars';

/**
 * Implementation of ITemplateService
 * Manages template persistence, dynamic variable replacement, and Redis caching.
 */
export class TemplateService implements ITemplateService {
  constructor(private cacheService: CacheService) {}

  /**
   * Compiles Handlebars template with dynamic variables and renders HTML/Text content
   */
  async renderTemplate(templateNameOrId: string, data: Record<string, any>): Promise<RenderTemplateResult> {
    const template = await this.getTemplate(templateNameOrId);
    
    // Inject system defaults for missing non-payload variables
    const renderData = {
      ...data,
      app_name: data.app_name || (template as any).app_name || (template as any).appName || 'Enterprise ESP',
      app_logo: data.app_logo || (template as any).app_logo || (template as any).appLogo || '',
      app_url: data.app_url || (template as any).app_url || (template as any).appUrl || 'https://enterprise-esp.com',
      app_visit_url: data.app_visit_url || (template as any).app_visit_url || (template as any).appVisitUrl || 'https://enterprise-esp.com/visit',
      year: data.year || new Date().getFullYear().toString()
    };

    let html = template.html;
    let subject = template.subject;

    try {
      html = Handlebars.compile(template.html)(renderData);
      subject = Handlebars.compile(template.subject)(renderData);
    } catch (err) {
      console.warn('Handlebars failed in TemplateService, falling back to replace:', err);
      Object.keys(renderData).forEach(key => {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
        html = html.replace(regex, String(renderData[key]));
        subject = subject.replace(regex, String(renderData[key]));
      });
    }

    // Track missing required variables
    const requiredVars = template.variables || [];
    const missingVars: string[] = [];

    requiredVars.forEach(v => {
      const name = typeof v === 'string' ? v : (v as TemplateVariable).name;
      if (name && !(name in renderData)) {
        missingVars.push(name);
      }
    });

    return {
      renderedSubject: subject,
      renderedHtml: html,
      renderedText: template.text ? Handlebars.compile(template.text)(renderData) : undefined,
      missingVariables: missingVars
    };
  }

  /**
   * Creates or updates a template definition, validating Handlebars syntax
   */
  async saveTemplate(dto: CreateTemplateDto, adminUserId?: string): Promise<{ id: string; version: number }> {
    // 1. Validate Handlebars syntax before saving
    try {
      Handlebars.compile(dto.html);
      Handlebars.compile(dto.subject);
    } catch (err: any) {
      throw new Error(`خطأ في صياغة قالب Handlebars: ${err?.message || String(err)}`);
    }

    // 2. Automatically extract variables if none are supplied
    const extracted = this.extractVariables(dto.html, dto.subject);
    const varNames = dto.variables && dto.variables.length > 0 
      ? dto.variables.map(v => typeof v === 'string' ? v : v.name) 
      : extracted;

    // Check if we are updating an existing template by name or ID
    const existing = dbStore.getTemplates().find(t => t.id === dto.name || t.name === dto.name);

    let savedTemplate: EmailTemplate;

    const mappedData: Partial<EmailTemplate> = {
      name: dto.name,
      description: dto.description,
      scope: dto.scope === 'system' ? 'global' : (dto.scope || 'global'),
      app_id: dto.appId,
      app_name: dto.appName,
      subject: dto.subject,
      html: dto.html,
      text: dto.text,
      variables: varNames,
      category: (dto.category as any) || 'transactional',
      is_active: true
    };

    if (existing) {
      savedTemplate = dbStore.updateTemplate(existing.id, mappedData) as EmailTemplate;
    } else {
      savedTemplate = dbStore.createTemplate(mappedData) as EmailTemplate;
    }

    // Invalidate old caches
    await this.cacheService.del(`template:${savedTemplate.id}`);
    await this.cacheService.del(`template:${savedTemplate.name}`);

    return {
      id: savedTemplate.id,
      version: savedTemplate.version || 1
    };
  }

  /**
   * Retrieves template details by name or UUID, utilizing Redis cache
   */
  async getTemplate(identifier: string): Promise<CreateTemplateDto & { id: string; version: number }> {
    const cached = await this.cacheService.getTemplate(identifier);
    if (cached) return cached;

    const fromDb = dbStore.getTemplateById(identifier);
    if (fromDb) {
      const mapped: CreateTemplateDto & { id: string; version: number } = {
        name: fromDb.name,
        description: fromDb.description,
        scope: fromDb.scope || 'global',
        appId: fromDb.app_id,
        appName: fromDb.app_name,
        subject: fromDb.subject,
        html: fromDb.html,
        text: fromDb.text,
        variables: (fromDb.variables || []).map(v => ({ name: v, type: 'string' as const, required: true })),
        category: fromDb.category,
        id: fromDb.id,
        version: fromDb.version || 1
      };
      
      await this.cacheService.cacheTemplate(identifier, mapped);
      if (identifier !== fromDb.id) {
        await this.cacheService.cacheTemplate(fromDb.id, mapped);
      }
      return mapped;
    }

    throw new Error(`Template "${identifier}" not found`);
  }

  /**
   * Validates required data variables against template requirements before dispatch
   */
  async validateTemplateData(templateNameOrId: string, data: Record<string, any>): Promise<{ isValid: boolean; missingKeys: string[] }> {
    const template = await this.getTemplate(templateNameOrId);
    const requiredVars = template.variables || [];
    const missingKeys: string[] = [];

    requiredVars.forEach(v => {
      const name = typeof v === 'string' ? v : (v as TemplateVariable).name;
      if (name && !(name in data)) {
        missingKeys.push(name);
      }
    });

    return {
      isValid: missingKeys.length === 0,
      missingKeys
    };
  }

  /**
   * Lists available email templates filtered by scope or category
   */
  async listTemplates(filter?: { category?: string; scope?: string }): Promise<Array<CreateTemplateDto & { id: string }>> {
    const all = dbStore.getTemplates();
    const mapped = all.map(t => ({
      name: t.name,
      description: t.description,
      scope: t.scope || 'global',
      appId: t.app_id,
      appName: t.app_name,
      subject: t.subject,
      html: t.html,
      text: t.text,
      variables: (t.variables || []).map(v => ({ name: v, type: 'string' as const, required: true })),
      category: t.category,
      id: t.id,
      version: t.version || 1
    }));

    return mapped.filter(t => {
      if (filter?.category && t.category !== filter.category) return false;
      if (filter?.scope && t.scope !== filter.scope) return false;
      return true;
    });
  }

  /**
   * Dynamically extracts variables (format: {{variable}}) from HTML & Subject
   */
  public extractVariables(html: string, subject: string): string[] {
    const regex = /\{\{\s*([\w_]+)\s*\}\}/g;
    const vars = new Set<string>();
    let match;
    
    while ((match = regex.exec(html)) !== null) {
      vars.add(match[1]);
    }
    
    // Reset regex index for subject search
    regex.lastIndex = 0;
    while ((match = regex.exec(subject)) !== null) {
      vars.add(match[1]);
    }

    const helpers = ['if', 'else', 'unless', 'each', 'with', 'lookup', 'log', 'this', 'root'];
    const systemVars = ['app_name', 'app_logo', 'app_url', 'app_visit_url', 'year'];

    return Array.from(vars).filter(v => !helpers.includes(v) && !systemVars.includes(v));
  }

  /**
   * Deletes a template from the persistence database and invalidates its Redis cache
   */
  public async deleteTemplate(id: string): Promise<boolean> {
    const success = dbStore.deleteTemplate(id);
    if (success) {
      await this.cacheService.del(`template:${id}`);
    }
    return success;
  }
}
