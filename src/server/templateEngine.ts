/**
 * Email Template Engine
 * Parses dynamic handlebars-like Mustache tags {{var_name}} and renders HTML & Plain text
 */

import Handlebars from 'handlebars';

export function extractVariables(html: string, text?: string): string[] {
  const combined = (html || '') + ' ' + (text || '');
  const regex = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;
  const vars = new Set<string>();
  let match;
  while ((match = regex.exec(combined)) !== null) {
    if (match[1]) {
      vars.add(match[1]);
    }
  }
  return Array.from(vars);
}

export function renderTemplate(
  templateContent: string, 
  data: Record<string, any> = {}
): string {
  if (!templateContent) return '';
  try {
    const template = Handlebars.compile(templateContent);
    return template(data);
  } catch (err) {
    console.warn('Handlebars compilation failed, falling back to simple replace:', err);
    return templateContent.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, varName) => {
      if (data && varName in data && data[varName] !== undefined && data[varName] !== null) {
        return String(data[varName]);
      }
      return `[${varName}]`;
    });
  }
}

