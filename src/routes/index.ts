import { Router } from 'express';
import authRoutes from './auth.routes';
import emailRoutes from './email.routes';
import templatesRoutes from './templates.routes';
import adminRoutes from './admin.routes';
import sdkRoutes from './sdk.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/email', emailRoutes);
router.use('/templates', templatesRoutes);
router.use('/admin', adminRoutes);
router.use('/sdk', sdkRoutes);

export default router;
