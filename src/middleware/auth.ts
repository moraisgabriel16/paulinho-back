import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
  user?: any;
}

export const authMiddleware = (req: any, res: Response, next: NextFunction): void => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({ message: 'Token não fornecido' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sua_chave_secreta');
    req.userId = (decoded as any).userId;
    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
  }
};

export const adminMiddleware = (req: any, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'professor') {
    res.status(403).json({ message: 'Acesso negado. Apenas professores podem fazer isso.' });
    return;
  }
  next();
};
