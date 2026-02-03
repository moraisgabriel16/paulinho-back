import { Router } from 'express';
import {
  register,
  login,
  getProfile,
  validateRegister,
  validateLogin,
} from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Rotas públicas
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Rotas protegidas
router.get('/profile', authMiddleware, getProfile);

export default router;
