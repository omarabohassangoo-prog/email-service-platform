import { describe, it, expect } from 'vitest';

function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function calculatePriorityScore(priority: 'high' | 'normal' | 'low'): number {
  switch (priority) {
    case 'high': return 1;
    case 'normal': return 5;
    case 'low': return 10;
    default: return 5;
  }
}

describe('Email Validation & Queue Unit Tests', () => {
  it('should validate email addresses correctly', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('user.name+tag@sub.domain.org')).toBe(true);
    expect(validateEmail('invalid-email')).toBe(false);
    expect(validateEmail('missing@domain')).toBe(false);
  });

  it('should assign correct priority scores for queue ordering', () => {
    expect(calculatePriorityScore('high')).toBe(1);
    expect(calculatePriorityScore('normal')).toBe(5);
    expect(calculatePriorityScore('low')).toBe(10);
  });
});
