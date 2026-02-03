import { Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Express.Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Erro:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Erro de validação',
      errors: err.errors,
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      message: 'ID inválido',
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      message: `${field} já existe no sistema`,
    });
  }

  res.status(err.status || 500).json({
    message: err.message || 'Erro interno do servidor',
  });
};
