import { Router } from 'express';
import {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  addStudentToClass,
  removeStudentFromClass,
  validateClass,
} from '../controllers/classController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Rotas protegidas
router.get('/', authMiddleware, getAllClasses);
router.get('/:id', authMiddleware, getClassById);
router.post('/', authMiddleware, validateClass, createClass);
router.put('/:id', authMiddleware, validateClass, updateClass);
router.delete('/:id', authMiddleware, deleteClass);

// Rotas para adicionar/remover alunos
router.post('/:classId/students', authMiddleware, addStudentToClass);
router.delete('/:classId/students/:studentId', authMiddleware, removeStudentFromClass);

export default router;
