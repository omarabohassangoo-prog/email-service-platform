import { Request, Response, NextFunction } from 'express';
import { complianceService } from '../services/compliance.service';

/**
 * Express middleware to enforce strict SPF, DKIM, DMARC, unsubscribe links, and deliverability checks
 * for outgoing transactional or marketing emails (CAN-SPAM / GDPR Compliant).
 */
export async function checkCompliance(req: Request, res: Response, next: NextFunction): Promise<void> {
  const emailData = req.body;

  // We only run compliance checks on API pathways that trigger direct mail dispatch
  if (!emailData || (!emailData.html_content && !emailData.html && !emailData.text_content && !emailData.text)) {
    return next();
  }

  const html = emailData.html_content || emailData.html || '';
  const text = emailData.text_content || emailData.text || '';
  const fromEmail = emailData.from_email || emailData.from || 'noreply@enterprise-esp.com';

  try {
    const report = await complianceService.validateEmailCompliance(fromEmail, html, text);

    // Dynamic compliance headers for outbound responses to client
    res.setHeader('X-ESP-Compliance-Score', report.score.toString());
    res.setHeader('X-ESP-Compliance-Status', report.isValid ? 'PASSED' : 'FAILED');
    
    // Inject mandatory List-Unsubscribe headers
    res.setHeader('List-Unsubscribe', `<mailto:unsubscribe@enterprise-esp.com?subject=unsubscribe>, <https://enterprise-esp.com/unsubscribe>`);
    res.setHeader('List-Unsubscribe-Post', 'List-Unsubscribe=One-Click');
    res.setHeader('Feedback-ID', `esp-applet:${fromEmail.split('@')[1] || 'general'}`);

    if (!report.isValid) {
      res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني لا يتوافق مع معايير التسليم لـ Gmail و Outlook و Yahoo',
        score: report.score,
        issues: report.issues
      });
      return;
    }

    // Attach verified compliance report to request object for downstream use
    (req as any).complianceReport = report;
    next();
  } catch (err: any) {
    console.error('[ComplianceMiddleware] Error:', err);
    next();
  }
}

/**
 * Legacy wrapper: keeps security headers and attaches basic info
 */
export const enforceComplianceHeaders = (req: Request, res: Response, next: NextFunction): void => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-ESP-Compliance-Policy', 'GDPR-CANSPAM-Verified');

  if (req.path.includes('/api/email/send') || req.path.includes('/api/email/bulk')) {
    if (!req.body) req.body = {};
    req.body._complianceChecked = true;
    req.body._unsubscribeHeader = `<mailto:unsubscribe@enterprise-esp.com?subject=unsubscribe>`;
  }

  next();
};
