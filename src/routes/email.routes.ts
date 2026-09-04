import { Router, Request, Response } from 'express';
import { container } from '../services/container';
import { authenticateApiKey } from '../middleware/auth.middleware';
import { validateSendEmailDto } from '../middleware/validation.middleware';
import { enforceComplianceHeaders, checkCompliance } from '../middleware/compliance.middleware';
import { rateLimiter } from '../middleware/rate-limit.middleware';

const router = Router();

router.use(authenticateApiKey);
router.use(enforceComplianceHeaders);
router.use(checkCompliance);
router.use(rateLimiter('email'));

/**
 * @route POST /api/email/send
 * @desc Dispatch single transactional or template email
 */
router.post('/send', validateSendEmailDto, async (req: Request, res: Response, next) => {
  try {
    const apiKey = (req.headers['x-api-key'] as string) || (req.headers['authorization']?.replace('Bearer ', '') as string) || 'default_key';
    const result = await container.emailService.sendEmail(req.body, apiKey);
    res.status(202).json({
      success: true,
      data: result,
      message: 'Email job queued for delivery'
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route GET /api/email/status/:id
 * @desc Retrieve delivery status and timeline for email job
 */
router.get('/status/:id', async (req: Request, res: Response, next) => {
  try {
    const jobId = req.params.id;
    const status = await container.emailService.getEmailStatus(jobId);
    res.json({
      success: true,
      data: status
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route POST /api/email/bulk
 * @desc Bulk dispatch emails to multiple recipients in batch
 */
router.post('/bulk', async (req: Request, res: Response, next) => {
  try {
    const { recipients, templateId, templateData, subject } = req.body;
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      res.status(400).json({ success: false, error: 'Recipients array is required for bulk dispatch' });
      return;
    }

    const apiKey = (req.headers['x-api-key'] as string) || 'default_key';
    const batchId = `bulk_${Date.now()}`;
    const queuedJobs = [];

    for (const email of recipients) {
      const resVal = await container.emailService.sendEmail({
        to: [email],
        subject,
        templateId,
        templateData
      }, apiKey);
      queuedJobs.push(resVal.jobId);
    }

    res.status(202).json({
      success: true,
      data: {
        batchId,
        totalEnqueued: queuedJobs.length,
        jobIds: queuedJobs
      },
      message: `Successfully enqueued ${queuedJobs.length} emails in bulk batch`
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route POST /api/email/schedule
 * @desc Schedule an email for future delivery at specified timestamp
 */
router.post('/schedule', validateSendEmailDto, async (req: Request, res: Response, next) => {
  try {
    const { scheduledAt } = req.body;
    if (!scheduledAt) {
      res.status(400).json({ success: false, error: 'Field "scheduledAt" ISO date is required' });
      return;
    }

    const apiKey = (req.headers['x-api-key'] as string) || 'default_key';
    const result = await container.emailService.sendEmail({
      ...req.body,
      scheduledAt: new Date(scheduledAt)
    }, apiKey);

    res.status(202).json({
      success: true,
      data: {
        ...result,
        scheduledAt
      },
      message: `Email scheduled for ${scheduledAt}`
    });
  } catch (err) {
    next(err);
  }
});

export default router;
