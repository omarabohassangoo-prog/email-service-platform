import { Router, Request, Response } from 'express';
import { container } from '../services/container';
import { authenticateApiKey } from '../middleware/auth.middleware';
import { validateBodyFields } from '../middleware/validation.middleware';

const router = Router();

router.use(authenticateApiKey);

/**
 * @route GET /api/templates
 * @desc List available templates
 */
router.get('/', async (req: Request, res: Response, next) => {
  try {
    const category = req.query.category as string;
    const scope = req.query.scope as string;
    const list = await container.templateService.listTemplates({ category, scope });
    res.json({
      success: true,
      count: list.length,
      data: list
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route POST /api/templates
 * @desc Create a new email template
 */
router.post('/', validateBodyFields(['name', 'subject', 'html']), async (req: Request, res: Response, next) => {
  try {
    const result = await container.templateService.saveTemplate(req.body);
    res.status(201).json({
      success: true,
      data: result,
      message: 'Template created successfully'
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route GET /api/templates/:id
 * @desc Get single template details
 */
router.get('/:id', async (req: Request, res: Response, next) => {
  try {
    const template = await container.templateService.getTemplate(req.params.id);
    res.json({
      success: true,
      data: template
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route PUT /api/templates/:id
 * @desc Update an existing template
 */
router.put('/:id', async (req: Request, res: Response, next) => {
  try {
    const updated = await container.templateService.saveTemplate({
      ...req.body,
      name: req.params.id
    });
    res.json({
      success: true,
      data: updated,
      message: 'Template updated successfully'
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route DELETE /api/templates/:id
 * @desc Delete a template by ID
 */
router.delete('/:id', async (req: Request, res: Response, next) => {
  try {
    const success = await (container.templateService as any).deleteTemplate(req.params.id);
    res.json({
      success,
      message: `Template ${req.params.id} deleted successfully`
    });
  } catch (err) {
    next(err);
  }
});

export default router;
