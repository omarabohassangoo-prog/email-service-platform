import { describe, it, expect } from 'vitest';

function calculateDeliveryRate(delivered: number, total: number): number {
  if (total === 0) return 0;
  return Number(((delivered / total) * 100).toFixed(1));
}

function calculateBounceRate(bounced: number, total: number): number {
  if (total === 0) return 0;
  return Number(((bounced / total) * 100).toFixed(1));
}

describe('Analytics & Metrics Unit Tests', () => {
  it('should calculate delivery rate accurately', () => {
    expect(calculateDeliveryRate(980, 1000)).toBe(98.0);
    expect(calculateDeliveryRate(28120, 28450)).toBe(98.8);
    expect(calculateDeliveryRate(0, 0)).toBe(0);
  });

  it('should calculate bounce rate accurately', () => {
    expect(calculateBounceRate(12, 1000)).toBe(1.2);
    expect(calculateBounceRate(355, 28450)).toBe(1.2);
  });
});
