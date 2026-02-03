import { Router } from 'express';
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  validateStudent,
} from '../controllers/studentController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Rotas protegidas
router.get('/', authMiddleware, getAllStudents);
router.get('/:id', authMiddleware, getStudentById);
router.post('/', authMiddleware, validateStudent, createStudent);
router.put('/:id', authMiddleware, validateStudent, updateStudent);
router.delete('/:id', authMiddleware, deleteStudent);

export default router;
