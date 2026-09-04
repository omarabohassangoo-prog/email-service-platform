import { Request, Response, NextFunction } from 'express';

/**
 * Middleware factory for validating required JSON body fields
 */
export const validateBodyFields = (requiredFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.body || typeof req.body !== 'object') {
      res.status(400).json({
        success: false,
        error: 'Bad Request: JSON body payload is required'
      });
      return;
    }

    const missingFields = requiredFields.filter(field => {
      const val = req.body[field];
      return val === undefined || val === null || val === '';
    });

    if (missingFields.length > 0) {
      res.status(400).json({
        success: false,
        error: `Validation Error: Missing required fields: [${missingFields.join(', ')}]`,
        missingFields
      });
      return;
    }

    next();
  };
};

/**
 * Specific Validator for Email Dispatch Payload
 */
export const validateSendEmailDto = (req: Request, res: Response, next: NextFunction): void => {
  const { to, html, templateId } = req.body;

  if (!to || (!Array.isArray(to) && typeof to !== 'string') || (Array.isArray(to) && to.length === 0)) {
    res.status(400).json({
      success: false,
      error: 'Validation Error: Field "to" must be a non-empty string or array of recipient emails'
    });
    return;
  }

  if (!html && !templateId) {
    res.status(400).json({
      success: false,
      error: 'Validation Error: Either "html" body content or a valid "templateId" must be provided'
    });
    return;
  }

  next();
};
