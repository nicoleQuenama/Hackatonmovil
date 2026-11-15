import { Router } from 'express';
import {
  getAlerts,
  getActiveAlertsHandler,
  getAlertByIdHandler,
  createAlert,
  updateAlertStatus,
  createAlertValidators,
  updateStatusValidators,
} from '../controllers/alerts.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateMiddleware } from '../middleware/validate.middleware';

const router = Router();

// GET /api/alerts          (public - mobile app needs to list)
router.get('/', getAlerts);

// GET /api/alerts/active   (public)
router.get('/active', getActiveAlertsHandler);

// GET /api/alerts/:id      (public)
router.get('/:id', getAlertByIdHandler);

// POST /api/alerts         (protected - create alert)
router.post('/', authMiddleware, createAlertValidators, validateMiddleware, createAlert);

// PATCH /api/alerts/:id/estado  (protected - update status)
router.patch('/:id/estado', authMiddleware, updateStatusValidators, validateMiddleware, updateAlertStatus);

export default router;
