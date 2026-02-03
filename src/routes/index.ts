import { Router } from 'express';
import authRoutes from './authRoutes';
import studentRoutes from './studentRoutes';
import classRoutes from './classRoutes';
import evaluationRoutes from './evaluationRoutes';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'API funcionando corretamente' });
});

// Rotas de autenticação
router.use('/auth', authRoutes);

// Rotas de alunos
router.use('/students', studentRoutes);

// Rotas de turmas
router.use('/classes', classRoutes);

// Rotas de avaliações
router.use('/evaluations', evaluationRoutes);

// Rota protegida de teste
router.get('/protected', authMiddleware, (req, res) => {
  res.json({ message: 'Rota protegida acessada com sucesso' });
});

export default router;
