// Import the Express app from dist
const app = require('../dist/index.js').default || require('../dist/index.js');

// Export for Vercel
module.exports = app;
