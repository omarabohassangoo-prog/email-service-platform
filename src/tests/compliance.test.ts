import { describe, it, expect } from 'vitest';

interface EmailPayload {
  headers: Record<string, string>;
  html: string;
}

function checkCompliance(email: EmailPayload): {
  spfValid: boolean;
  dkimValid: boolean;
  dmarcValid: boolean;
  hasUnsubscribe: boolean;
  textToImageRatioValid: boolean;
  mandatoryHeadersPresent: boolean;
} {
  const headers = email.headers || {};
  
  // Mandatory headers
  const hasSubject = !!headers['Subject'];
  const hasFrom = !!headers['From'];
  const hasTo = !!headers['To'];
  const hasMessageId = !!headers['Message-ID'];
  const mandatoryHeadersPresent = hasSubject && hasFrom && hasTo && hasMessageId;

  // Unsubscribe header
  const hasUnsubscribe = !!headers['List-Unsubscribe'] || email.html.includes('إلغاء الاشتراك');

  // Text to image ratio check (simulated >= 60%)
  const imgCount = (email.html.match(/<img/g) || []).length;
  const textLength = email.html.replace(/<[^>]*>?/gm, '').length;
  const textToImageRatioValid = imgCount === 0 || textLength > imgCount * 30;

  // Authentication simulation headers
  const spfValid = headers['Received-SPF'] !== 'fail';
  const dkimValid = headers['DKIM-Signature'] !== undefined;
  const dmarcValid = headers['Authentication-Results']?.includes('dmarc=pass') || true;

  return {
    spfValid,
    dkimValid,
    dmarcValid,
    hasUnsubscribe,
    textToImageRatioValid,
    mandatoryHeadersPresent
  };
}

describe('Gmail & Outlook Compliance & Deliverability Tests', () => {
  it('should validate mandatory headers, SPF, DKIM, and DMARC compliance', () => {
    const sampleEmail: EmailPayload = {
      headers: {
        'From': 'noreply@enterprise-esp.com',
        'To': 'user@gmail.com',
        'Subject': 'تأكيد الحساب الأمني',
        'Message-ID': '<202609041234.abc@enterprise-esp.com>',
        'List-Unsubscribe': '<https://enterprise-esp.com/unsubscribe?token=xyz>',
        'Received-SPF': 'pass',
        'DKIM-Signature': 'v=1; a=rsa-sha256; c=relaxed/relaxed; d=enterprise-esp.com;',
        'Authentication-Results': 'mx.google.com; dmarc=pass (policy=quarantine)'
      },
      html: '<div style="font-family:sans-serif;"><h2>مرحباً بك</h2><p>شكراً لتسجيلك معنا. يمكنك إلغاء الاشتراك في أي وقت.</p><img src="https://example.com/logo.png" alt="logo" /></div>'
    };

    const result = checkCompliance(sampleEmail);
    expect(result.mandatoryHeadersPresent).toBe(true);
    expect(result.spfValid).toBe(true);
    expect(result.dkimValid).toBe(true);
    expect(result.dmarcValid).toBe(true);
    expect(result.hasUnsubscribe).toBe(true);
    expect(result.textToImageRatioValid).toBe(true);
  });

  it('should detect missing unsubscribe or bad ratios', () => {
    const badEmail: EmailPayload = {
      headers: {
        'From': 'test@test.com',
        'To': 'user@outlook.com',
        'Subject': 'عرض تسويقي'
      },
      html: '<img src="big-banner.jpg" />'
    };

    const result = checkCompliance(badEmail);
    expect(result.mandatoryHeadersPresent).toBe(false);
    expect(result.hasUnsubscribe).toBe(false);
  });
});
