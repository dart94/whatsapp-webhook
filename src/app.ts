import express from 'express';
import webhookRoutes from './routes/webhook.routes';
import templatesRoutes from './routes/template.routes';
import { PORT } from './config/constants';

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/webhook', webhookRoutes);
app.use('/templates', templatesRoutes);


// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('⚠️ Error:', err.stack);
  //Permite ngrok
  res.header('ngrok-skip-browser-warning', 'true');
  res.status(500).send('Something broke!');
});

export default app;