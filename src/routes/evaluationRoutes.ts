import { Router } from 'express';
import {
  createEvaluation,
  getEvaluationsByStudent,
  getEvaluationsByClass,
  getEvaluationById,
  updateEvaluation,
  deleteEvaluation,
  getStudentProgress,
  getClassProgress,
  validateEvaluation,
} from '../controllers/evaluationController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Rotas protegidas
router.post('/', authMiddleware, validateEvaluation, createEvaluation);
router.get('/:id', authMiddleware, getEvaluationById);
router.put('/:id', authMiddleware, validateEvaluation, updateEvaluation);
router.delete('/:id', authMiddleware, deleteEvaluation);

// Rotas de progresso
router.get('/student/:studentId', authMiddleware, getEvaluationsByStudent);
router.get('/class/:classId', authMiddleware, getEvaluationsByClass);
router.get('/progress/student/:studentId', authMiddleware, getStudentProgress);
router.get('/progress/class/:classId', authMiddleware, getClassProgress);

export default router;
