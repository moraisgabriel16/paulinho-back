import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Evaluation from '../models/Evaluation';
import Student from '../models/Student';
import Class from '../models/Class';

const criteria = ['coordination', 'balance', 'strength', 'laterality', 'flexibility', 'participation', 'speed'];

export const validateEvaluation = [
  body('student').notEmpty().withMessage('ID do aluno é obrigatório'),
  body('evaluationData.coordination').isFloat({ min: 1, max: 5 }).withMessage('Coordenação deve estar entre 1-5'),
  body('evaluationData.balance').isFloat({ min: 1, max: 5 }).withMessage('Equilíbrio deve estar entre 1-5'),
  body('evaluationData.strength').isFloat({ min: 1, max: 5 }).withMessage('Força deve estar entre 1-5'),
  body('evaluationData.laterality').isFloat({ min: 1, max: 5 }).withMessage('Lateralidade deve estar entre 1-5'),
  body('evaluationData.flexibility').isFloat({ min: 1, max: 5 }).withMessage('Flexibilidade deve estar entre 1-5'),
  body('evaluationData.participation').isFloat({ min: 1, max: 5 }).withMessage('Participação deve estar entre 1-5'),
  body('evaluationData.speed').isFloat({ min: 1, max: 5 }).withMessage('Velocidade deve estar entre 1-5'),
  // Campos de texto são opcionais
  body('strengths').isString().optional({ checkFalsy: true }),
  body('pointsToDevelop').isString().optional({ checkFalsy: true }),
];

const handleValidationErrors = (req: Request, res: Response): boolean => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return true;
  }
  return false;
};

export const createEvaluation = async (req: Request, res: Response) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const { student, class: classId, evaluationData, strengths, pointsToDevelop } = req.body;
    const teacher = (req as any).userId;

    // Verificar se aluno existe
    const studentExists = await Student.findById(student);
    if (!studentExists) {
      return res.status(404).json({ message: 'Aluno não encontrado' });
    }

    const evaluation = new Evaluation({
      student,
      class: classId,
      teacher,
      evaluationData,
      strengths,
      pointsToDevelop,
      date: new Date(),
    });

    await evaluation.save();
    await evaluation.populate('student', 'name age grade');
    await evaluation.populate('class', 'name');
    await evaluation.populate('teacher', 'name email');

    res.status(201).json({
      message: 'Avaliação criada com sucesso',
      evaluation,
    });
  } catch (error) {
    console.error('Erro ao criar avaliação:', error);
    res.status(500).json({ message: 'Erro ao criar avaliação' });
  }
};

export const getEvaluationsByStudent = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;

    const evaluations = await Evaluation.find({ student: studentId })
      .populate('student', 'name age grade')
      .populate('class', 'name')
      .populate('teacher', 'name email')
      .sort({ date: -1 });

    res.json(evaluations);
  } catch (error) {
    console.error('Erro ao obter avaliações do aluno:', error);
    res.status(500).json({ message: 'Erro ao obter avaliações' });
  }
};

export const getEvaluationsByClass = async (req: Request, res: Response) => {
  try {
    const { classId } = req.params;

    const evaluations = await Evaluation.find({ class: classId })
      .populate('student', 'name age grade')
      .populate('class', 'name')
      .populate('teacher', 'name email')
      .sort({ date: -1 });

    res.json(evaluations);
  } catch (error) {
    console.error('Erro ao obter avaliações da turma:', error);
    res.status(500).json({ message: 'Erro ao obter avaliações' });
  }
};

export const getEvaluationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const evaluation = await Evaluation.findById(id)
      .populate('student', 'name age grade observations')
      .populate('class', 'name grade')
      .populate('teacher', 'name email');

    if (!evaluation) {
      return res.status(404).json({ message: 'Avaliação não encontrada' });
    }

    res.json(evaluation);
  } catch (error) {
    console.error('Erro ao obter avaliação:', error);
    res.status(500).json({ message: 'Erro ao obter avaliação' });
  }
};

export const updateEvaluation = async (req: Request, res: Response) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const { id } = req.params;
    const { evaluationData, strengths, pointsToDevelop } = req.body;

    const evaluation = await Evaluation.findByIdAndUpdate(
      id,
      {
        evaluationData,
        strengths,
        pointsToDevelop,
      },
      { new: true, runValidators: true }
    )
      .populate('student', 'name age grade')
      .populate('class', 'name')
      .populate('teacher', 'name email');

    if (!evaluation) {
      return res.status(404).json({ message: 'Avaliação não encontrada' });
    }

    res.json({
      message: 'Avaliação atualizada com sucesso',
      evaluation,
    });
  } catch (error) {
    console.error('Erro ao atualizar avaliação:', error);
    res.status(500).json({ message: 'Erro ao atualizar avaliação' });
  }
};

export const deleteEvaluation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const evaluation = await Evaluation.findByIdAndDelete(id);

    if (!evaluation) {
      return res.status(404).json({ message: 'Avaliação não encontrada' });
    }

    res.json({
      message: 'Avaliação deletada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao deletar avaliação:', error);
    res.status(500).json({ message: 'Erro ao deletar avaliação' });
  }
};

export const getStudentProgress = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;

    const evaluations = await Evaluation.find({ student: studentId })
      .sort({ date: 1 })
      .lean();

    if (evaluations.length === 0) {
      return res.json({
        studentId,
        message: 'Sem avaliações para este aluno',
        data: [],
      });
    }

    // Agrupar por critério e calcular evolução
    const progressData = criteria.map((criterion) => {
      const evaluationsCriterion = evaluations.map((e) => ({
        date: e.date,
        value: e.evaluationData[criterion as keyof typeof e.evaluationData],
      }));

      return {
        criterion,
        evaluations: evaluationsCriterion,
        latest: evaluationsCriterion[evaluationsCriterion.length - 1]?.value || 0,
        average: evaluationsCriterion.reduce((sum, e) => sum + e.value, 0) / evaluationsCriterion.length,
      };
    });

    res.json({
      studentId,
      totalEvaluations: evaluations.length,
      progressData,
    });
  } catch (error) {
    console.error('Erro ao obter progresso do aluno:', error);
    res.status(500).json({ message: 'Erro ao obter progresso' });
  }
};

export const getClassProgress = async (req: Request, res: Response) => {
  try {
    const { classId } = req.params;

    const evaluations = await Evaluation.find({ class: classId })
      .sort({ date: 1 })
      .lean();

    if (evaluations.length === 0) {
      return res.json({
        classId,
        message: 'Sem avaliações para esta turma',
        data: [],
      });
    }

    // Agrupar por critério e calcular médias
    const progressData = criteria.map((criterion) => {
      const evaluationsCriterion = evaluations.map((e) => ({
        date: e.date,
        value: e.evaluationData[criterion as keyof typeof e.evaluationData],
      }));

      return {
        criterion,
        evaluations: evaluationsCriterion,
        average: evaluationsCriterion.reduce((sum, e) => sum + e.value, 0) / evaluationsCriterion.length,
        maxValue: Math.max(...evaluationsCriterion.map((e) => e.value)),
        minValue: Math.min(...evaluationsCriterion.map((e) => e.value)),
      };
    });

    res.json({
      classId,
      totalEvaluations: evaluations.length,
      progressData,
    });
  } catch (error) {
    console.error('Erro ao obter progresso da turma:', error);
    res.status(500).json({ message: 'Erro ao obter progresso' });
  }
};
