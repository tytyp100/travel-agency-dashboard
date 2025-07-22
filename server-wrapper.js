import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequestHandler } from '@react-router/express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Safari compatibility middleware
app.use((req, res, next) => {
  // Set proper MIME types for Safari
  if (req.path.endsWith('.js')) {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  } else if (req.path.endsWith('.css')) {
    res.setHeader('Content-Type', 'text/css; charset=utf-8');
  }
  
  // Safari cache headers
  res.setHeader('Cache-Control', 'public, max-age=31536000');
  res.setHeader('Vary', 'Accept-Encoding');
  
  next();
});

// Serve static assets from build/client
app.use('/assets', express.static(path.join(__dirname, 'build/client/assets')));

// Handle favicon requests
app.get('/favicon.ico', (req, res) => {
  res.status(204).send(); // No content response
});

// Serve other static files (like favicon, images, etc.)
app.use(express.static(path.join(__dirname, 'build/client'), {
  index: false // Don't serve index.html from static middleware
}));

// Handle all other requests with React Router
const viteDevServer = undefined; // We're in production
app.all('*', createRequestHandler({
  build: () => import('./build/server/index.js'),
  mode: 'production'
}));

const port = process.env.PORT || 3000;
const host = process.env.HOST || '0.0.0.0';

app.listen(port, host, () => {
  console.log(`Server running on http://${host}:${port}`);
});
