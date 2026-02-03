// Import the Express app from compiled output
let app;

try {
  const compiled = require('../dist/index.js');
  app = compiled.default || compiled;
  console.log('✅ App imported successfully');
} catch (error) {
  console.error('❌ Error importing app:', error.message);
  // Fallback: create a simple error handler
  const express = require('express');
  app = express();
  app.use((req, res) => {
    res.status(500).json({ 
      error: 'Server configuration error',
      message: error.message 
    });
  });
}

// Export as Vercel handler
module.exports = app;
