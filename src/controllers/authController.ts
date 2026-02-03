import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User, { IUser } from '../models/User';

export const validateRegister = [
  body('name').trim().notEmpty().withMessage('Nome é obrigatório'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('role').isIn(['professor', 'coordenador']).withMessage('Role inválido'),
];

export const validateLogin = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Senha é obrigatória'),
];

const handleValidationErrors = (req: Request, res: Response): boolean => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return true;
  }
  return false;
};

const generateToken = (userId: string): string => {
  return jwt.sign(
    { userId },
    (process.env.JWT_SECRET || 'sua_chave_secreta') as string,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

export const register = async (req: Request, res: Response) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const { name, email, password, role = 'professor', school } = req.body;

    // Verificar se usuário já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email já cadastrado' });
    }

    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Criar novo usuário
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      school,
    });

    await user.save();

    // Gerar token
    const token = generateToken(user._id.toString());

    // Responder sem a senha
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      school: user.school,
    };

    res.status(201).json({
      message: 'Usuário registrado com sucesso',
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error('Erro ao registrar:', error);
    res.status(500).json({ message: 'Erro ao registrar usuário' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const { email, password } = req.body;

    try {
      // Encontrar usuário
      const user = await Promise.race([
        User.findOne({ email }).select('+password'),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database query timeout')), 8000)
        )
      ]) as IUser | null;
      
      if (!user) {
        return res.status(401).json({ message: 'Email ou senha inválidos' });
      }

      // Comparar senhas
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Email ou senha inválidos' });
      }

      // Gerar token
      const token = generateToken(user._id.toString());

      // Responder sem a senha
      const userResponse = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        school: user.school,
      };

      res.status(200).json({
        message: 'Login realizado com sucesso',
        token,
        user: userResponse,
      });
    } catch (dbError: any) {
      console.error('Database error:', dbError.message);
      
      // Se for timeout de database, retornar erro específico
      if (dbError.message.includes('timeout') || dbError.message.includes('buffering')) {
        return res.status(503).json({ 
          message: 'Serviço temporariamente indisponível. Tente novamente em alguns segundos.',
          details: 'Database connection timeout'
        });
      }
      
      throw dbError;
    }
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ message: 'Erro ao fazer login' });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      school: user.school,
    };

    res.json(userResponse);
  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    res.status(500).json({ message: 'Erro ao obter perfil' });
  }
};
