import { VercelRequest, VercelResponse } from '@vercel/node';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import connectDB from '../src/config/database';
import { errorHandler } from '../src/middleware/errorHandler';
import routes from '../src/routes';

dotenv.config();

let app: express.Application;

const initializeApp = () => {
  if (app) return app;

  app = express();

  connectDB();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Remover /api já que Vercel já mapeia /api para esta pasta
  app.use('/', routes);

  app.use(errorHandler);

  app.use((req, res) => {
    res.status(404).json({ message: 'Rota não encontrada' });
  });

  return app;
};

export default (req: VercelRequest, res: VercelResponse) => {
  const handler = initializeApp();
  handler(req, res);
};
