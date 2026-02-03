module.exports = (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Log para debug
  console.log(`${req.method} ${req.url}`);

  // Health check
  if (req.url === '/api/health' && req.method === 'GET') {
    return res.status(200).json({
      status: 'API funcionando',
      timestamp: new Date().toISOString(),
    });
  }

  // Root
  if (req.url === '/' && req.method === 'GET') {
    return res.status(200).json({
      message: 'API Paulinho Online',
      version: '1.0.0',
    });
  }

  // Register
  if (req.url === '/api/auth/register' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        if (!data.name || !data.email || !data.password) {
          return res.status(400).json({ error: 'Dados obrigatórios faltando' });
        }
        return res.status(201).json({
          token: 'jwt_token_aqui',
          user: {
            id: 'user123',
            name: data.name,
            email: data.email,
            role: data.role || 'professor'
          }
        });
      } catch (e) {
        return res.status(400).json({ error: 'JSON inválido' });
      }
    });
    return;
  }

  // Login
  if (req.url === '/api/auth/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        if (!data.email || !data.password) {
          return res.status(400).json({ error: 'Email e senha obrigatórios' });
        }
        return res.status(200).json({
          token: 'jwt_token_aqui',
          user: {
            id: 'user123',
            email: data.email,
            role: 'professor'
          }
        });
      } catch (e) {
        return res.status(400).json({ error: 'JSON inválido' });
      }
    });
    return;
  }

  // 404
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.url,
    method: req.method
  });
};
