import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import connectDB from './config/database';
import { errorHandler } from './middleware/errorHandler';
import routes from './routes';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check antes de conectar ao DB
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Conectar ao MongoDB - não bloquear em caso de erro
connectDB().catch(err => {
  console.error('⚠️ MongoDB connection error:', err.message);
});

// Rotas
app.use('/api', routes);

// Tratamento de erros
app.use(errorHandler);

// Handler 404
app.use((req, res) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

// Iniciar servidor apenas se não estiver em produção (Vercel)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  });
}

export default app;
