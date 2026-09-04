import { describe, it, expect } from 'vitest';
import Handlebars from 'handlebars';

function renderTemplate(templateStr: string, data: Record<string, any>): string {
  try {
    const template = Handlebars.compile(templateStr);
    return template(data);
  } catch (e) {
    return templateStr;
  }
}

function extractVariables(content: string): string[] {
  const regex = /{{\s*([a-zA-Z0-9_]+)\s*}}/g;
  const matches = new Set<string>();
  let match;
  while ((match = regex.exec(content)) !== null) {
    matches.add(match[1]);
  }
  return Array.from(matches);
}

describe('Template Engine Unit Tests', () => {
  it('should compile and render Handlebars template correctly', () => {
    const template = 'مرحباً بك {{userName}}, فاتورتك رقم {{invoiceId}}';
    const data = { userName: 'أحمد', invoiceId: 'INV-9988' };
    const result = renderTemplate(template, data);
    expect(result).toBe('مرحباً بك أحمد, فاتورتك رقم INV-9988');
  });

  it('should extract variables from template string correctly', () => {
    const content = '<p>أهلاً {{name}}, رصيدك الحالي هو {{balance}} في {{company}}</p>';
    const vars = extractVariables(content);
    expect(vars).toContain('name');
    expect(vars).toContain('balance');
    expect(vars).toContain('company');
    expect(vars.length).toBe(3);
  });
});
