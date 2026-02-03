const app = require('express')();
const cors = require('cors');

// Middleware básico
app.use(cors());
app.use(require('express').json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'API funcionando', timestamp: new Date().toISOString() });
});

// Root
app.get('/', (req, res) => {
  res.json({ message: 'API Paulinho', version: '1.0.0' });
});

// Auth routes - placeholder simples
app.post('/auth/register', (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Dados inválidos' });
  }
  res.json({
    token: 'token_jwt_aqui',
    user: { id: '123', name, email, role: role || 'professor' }
  });
});

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha obrigatórios' });
  }
  res.json({
    token: 'token_jwt_aqui',
    user: { id: '123', email, role: 'professor' }
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada', path: req.path });
});

module.exports = app;
