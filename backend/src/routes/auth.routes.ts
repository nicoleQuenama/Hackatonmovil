import { Router } from 'express';
import { login, me, loginValidators } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateMiddleware } from '../middleware/validate.middleware';

const router = Router();

// POST /api/auth/login
router.post('/login', loginValidators, validateMiddleware, login);

// GET /api/auth/me  (protected)
router.get('/me', authMiddleware, me);

export default router;
