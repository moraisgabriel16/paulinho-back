import { VercelRequest, VercelResponse } from '@vercel/node';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import connectDB from '../src/config/database';
import { errorHandler } from '../src/middleware/errorHandler';
import routes from '../src/routes';

dotenv.config();

const app = express();

// Inicializar conexão com MongoDB
connectDB().catch(err => console.error('Erro ao conectar MongoDB:', err));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check rápido
app.get('/', (req, res) => {
  res.json({ status: 'API está online', timestamp: new Date().toISOString() });
});

// Remover /api já que Vercel já mapeia /api para esta pasta
app.use('/', routes);

// Tratamento de erros
app.use(errorHandler);

// Handler 404
app.use((req, res) => {
  console.log(`404 - Rota não encontrada: ${req.method} ${req.path}`);
  res.status(404).json({ message: 'Rota não encontrada', path: req.path });
});

export default (req: VercelRequest, res: VercelResponse) => {
  return app(req, res);
};
