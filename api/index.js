// Simple Vercel Serverless Handler
module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token,X-Requested-With,Accept,Accept-Version,Content-Length,Content-MD5,Content-Type,Date,X-Api-Version,Authorization'
  );

  // Handle OPTIONS
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Parse JSON body
  let body = '';
  let data = {};
  
  if (req.method !== 'GET') {
    await new Promise((resolve) => {
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          data = JSON.parse(body);
        } catch (e) {
          data = {};
        }
        resolve();
      });
    });
  }

  const url = req.url || '/';
  const method = req.method;

  // Routes
  
  // GET /api/health
  if (method === 'GET' && url === '/api/health') {
    return res.status(200).json({
      status: 'ok',
      message: 'API is running',
      timestamp: new Date().toISOString()
    });
  }

  // GET /
  if (method === 'GET' && url === '/') {
    return res.status(200).json({
      name: 'Paulinho API',
      version: '1.0.0',
      status: 'online'
    });
  }

  // POST /api/auth/register
  if (method === 'POST' && url === '/api/auth/register') {
    const { name, email, password, role } = data;
    
    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'name, email and password are required'
      });
    }

    return res.status(201).json({
      token: 'jwt_token_placeholder_12345',
      user: {
        id: 'user_' + Date.now(),
        name,
        email,
        role: role || 'professor'
      }
    });
  }

  // POST /api/auth/login
  if (method === 'POST' && url === '/api/auth/login') {
    const { email, password } = data;
    
    if (!email || !password) {
      return res.status(400).json({
        error: 'email and password are required'
      });
    }

    return res.status(200).json({
      token: 'jwt_token_placeholder_12345',
      user: {
        id: 'user_123',
        email,
        role: 'professor'
      }
    });
  }

  // 404
  return res.status(404).json({
    error: 'Not Found',
    message: 'Route not found',
    path: url,
    method: method
  });
};
