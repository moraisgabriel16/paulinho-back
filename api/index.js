// Vercel Serverless Handler
// This file acts as the entry point for Vercel serverless functions

const express = require('express');
const cors = require('cors');

// Create a simple health endpoint
const app = express();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Try to load the full Express app
try {
  const fullApp = require('../dist/index.js').default || require('../dist/index.js');
  
  // If it's a function, call it. If it's an Express app, use it directly.
  if (typeof fullApp === 'function') {
    app.use(fullApp);
  } else {
    // Copy all routes and middleware from fullApp to app
    app._router = fullApp._router;
    // Copy other middleware
    for (const key in fullApp._events) {
      if (app._events) {
        app._events[key] = fullApp._events[key];
      }
    }
  }
  console.log('✅ Full app loaded');
} catch (error) {
  console.error('⚠️ Could not load full app:', error.message);
  // Continue with basic app that has only health endpoint
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'Error processing request' : err.message
  });
});

module.exports = app;
