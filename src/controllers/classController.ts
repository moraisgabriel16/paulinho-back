import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Class from '../models/Class';
import Student from '../models/Student';

export const validateClass = [
  body('name').trim().notEmpty().withMessage('Nome da turma é obrigatório'),
  body('grade')
    .isIn(['1º Ano', '2º Ano', '3º Ano', '4º Ano', '5º Ano', '6º Ano', '7º Ano', '8º Ano', '9º Ano'])
    .withMessage('Série inválida'),
];

const handleValidationErrors = (req: Request, res: Response): boolean => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return true;
  }
  return false;
};

export const getAllClasses = async (req: Request, res: Response) => {
  try {
    const classes = await Class.find()
      .populate('students', 'name age grade')
      .populate('teacher', 'name email');

    // Garantir que os IDs estão no formato correto
    const formattedClasses = classes.map(cls => ({
      ...cls.toObject(),
      id: cls._id.toString(),
    }));

    res.json(formattedClasses);
  } catch (error) {
    console.error('Erro ao listar turmas:', error);
    res.status(500).json({ message: 'Erro ao listar turmas' });
  }
};

export const getClassById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const cls = await Class.findById(id)
      .populate('students', 'name age grade observations')
      .populate('teacher', 'name email');

    if (!cls) {
      return res.status(404).json({ message: 'Turma não encontrada' });
    }

    res.json({
      ...cls.toObject(),
      id: cls._id.toString(),
    });
  } catch (error) {
    console.error('Erro ao obter turma:', error);
    res.status(500).json({ message: 'Erro ao obter turma' });
  }
};

export const createClass = async (req: Request, res: Response) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const { name, grade } = req.body;
    const teacher = (req as any).userId;

    const cls = new Class({
      name,
      grade,
      teacher,
      students: [],
    });

    await cls.save();
    await cls.populate('teacher', 'name email');

    res.status(201).json({
      message: 'Turma criada com sucesso',
      class: {
        ...cls.toObject(),
        id: cls._id.toString(),
      },
    });
  } catch (error: any) {
    console.error('Erro ao criar turma:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Nome da turma já existe' });
    }
    res.status(500).json({ message: 'Erro ao criar turma' });
  }
};

export const updateClass = async (req: Request, res: Response) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const { id } = req.params;
    const { name, grade } = req.body;

    const cls = await Class.findByIdAndUpdate(
      id,
      { name, grade },
      { new: true, runValidators: true }
    )
      .populate('students', 'name age grade')
      .populate('teacher', 'name email');

    if (!cls) {
      return res.status(404).json({ message: 'Turma não encontrada' });
    }

    res.json({
      message: 'Turma atualizada com sucesso',
      class: cls,
    });
  } catch (error) {
    console.error('Erro ao atualizar turma:', error);
    res.status(500).json({ message: 'Erro ao atualizar turma' });
  }
};

export const deleteClass = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const cls = await Class.findByIdAndDelete(id);

    if (!cls) {
      return res.status(404).json({ message: 'Turma não encontrada' });
    }

    res.json({
      message: 'Turma deletada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao deletar turma:', error);
    res.status(500).json({ message: 'Erro ao deletar turma' });
  }
};

export const addStudentToClass = async (req: Request, res: Response) => {
  try {
    const { classId } = req.params;
    const { studentId } = req.body;

    const cls = await Class.findById(classId);
    if (!cls) {
      return res.status(404).json({ message: 'Turma não encontrada' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Aluno não encontrado' });
    }

    if (cls.students.includes(studentId)) {
      return res.status(400).json({ message: 'Aluno já está na turma' });
    }

    cls.students.push(studentId);
    await cls.save();
    await cls.populate('students', 'name age grade');

    res.json({
      message: 'Aluno adicionado à turma com sucesso',
      class: cls,
    });
  } catch (error) {
    console.error('Erro ao adicionar aluno à turma:', error);
    res.status(500).json({ message: 'Erro ao adicionar aluno à turma' });
  }
};

export const removeStudentFromClass = async (req: Request, res: Response) => {
  try {
    const { classId, studentId } = req.params;

    const cls = await Class.findById(classId);
    if (!cls) {
      return res.status(404).json({ message: 'Turma não encontrada' });
    }

    cls.students = cls.students.filter((id) => id.toString() !== studentId);
    await cls.save();
    await cls.populate('students', 'name age grade');

    res.json({
      message: 'Aluno removido da turma com sucesso',
      class: cls,
    });
  } catch (error) {
    console.error('Erro ao remover aluno da turma:', error);
    res.status(500).json({ message: 'Erro ao remover aluno da turma' });
  }
};
