import { Request, Response } from 'express';
import { body, validationResult, param } from 'express-validator';
import Student from '../models/Student';
import Class from '../models/Class';

export const validateStudent = [
  body('name').trim().notEmpty().withMessage('Nome é obrigatório'),
  body('age').isInt({ min: 1, max: 25 }).withMessage('Idade deve estar entre 1 e 25'),
  body('grade')
    .isIn(['1º Ano', '2º Ano', '3º Ano', '4º Ano', '5º Ano', '6º Ano', '7º Ano', '8º Ano', '9º Ano'])
    .withMessage('Série inválida'),
  body('classId')
    .trim()
    .optional({ checkFalsy: true })
    .isMongoId()
    .withMessage('ID da turma inválido'),
];

const handleValidationErrors = (req: Request, res: Response): boolean => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return true;
  }
  return false;
};

export const getAllStudents = async (req: Request, res: Response) => {
  try {
    const { classId } = req.query;
    const query = classId ? { classId } : {};

    const students = await Student.find(query).populate('classId', 'name').populate('teacher', 'name email');

    res.json(students);
  } catch (error) {
    console.error('Erro ao listar alunos:', error);
    res.status(500).json({ message: 'Erro ao listar alunos' });
  }
};

export const getStudentById = async (req: Request, res: Response) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const { id } = req.params;
    const student = await Student.findById(id).populate('classId', 'name').populate('teacher', 'name email');

    if (!student) {
      return res.status(404).json({ message: 'Aluno não encontrado' });
    }

    res.json(student);
  } catch (error) {
    console.error('Erro ao obter aluno:', error);
    res.status(500).json({ message: 'Erro ao obter aluno' });
  }
};

export const createStudent = async (req: Request, res: Response) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const { name, age, grade, classId, observations } = req.body;
    const teacher = (req as any).userId;

    const student = new Student({
      name,
      age,
      grade,
      classId,
      observations,
      teacher,
    });

    await student.save();

    // Se o aluno tem uma turma, adicionar o aluno à turma
    if (classId) {
      await Class.findByIdAndUpdate(
        classId,
        { $addToSet: { students: student._id } },
        { new: true }
      );
    }

    await student.populate('classId', 'name');
    await student.populate('teacher', 'name email');

    res.status(201).json({
      message: 'Aluno criado com sucesso',
      student,
    });
  } catch (error) {
    console.error('Erro ao criar aluno:', error);
    res.status(500).json({ message: 'Erro ao criar aluno' });
  }
};

export const updateStudent = async (req: Request, res: Response) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const { id } = req.params;
    const { name, age, grade, classId, observations } = req.body;

    // Obter o aluno atual para saber a turma anterior
    const currentStudent = await Student.findById(id);
    if (!currentStudent) {
      return res.status(404).json({ message: 'Aluno não encontrado' });
    }

    // Se a turma mudou, remover o aluno da turma anterior e adicionar à nova
    if (classId && currentStudent.classId?.toString() !== classId) {
      // Remover da turma anterior
      if (currentStudent.classId) {
        await Class.findByIdAndUpdate(
          currentStudent.classId,
          { $pull: { students: id } }
        );
      }
      // Adicionar à nova turma
      await Class.findByIdAndUpdate(
        classId,
        { $addToSet: { students: id } }
      );
    } else if (!classId && currentStudent.classId) {
      // Se removeu a turma, remover da turma anterior
      await Class.findByIdAndUpdate(
        currentStudent.classId,
        { $pull: { students: id } }
      );
    }

    const student = await Student.findByIdAndUpdate(
      id,
      {
        name,
        age,
        grade,
        classId,
        observations,
      },
      { new: true, runValidators: true }
    )
      .populate('classId', 'name')
      .populate('teacher', 'name email');

    res.json({
      message: 'Aluno atualizado com sucesso',
      student,
    });
  } catch (error) {
    console.error('Erro ao atualizar aluno:', error);
    res.status(500).json({ message: 'Erro ao atualizar aluno' });
  }
};

export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const student = await Student.findByIdAndDelete(id);

    if (!student) {
      return res.status(404).json({ message: 'Aluno não encontrado' });
    }

    // Remover o aluno da turma
    if (student.classId) {
      await Class.findByIdAndUpdate(
        student.classId,
        { $pull: { students: id } }
      );
    }

    res.json({
      message: 'Aluno deletado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao deletar aluno:', error);
    res.status(500).json({ message: 'Erro ao deletar aluno' });
  }
};
