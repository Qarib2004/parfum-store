import express, {type Application } from 'express';
import { createServer } from 'http';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import initSocket from './socket/socket';
import { apiLimiter, corsMiddleware, errorHandler, notFound } from './middleware';
import { setupSwagger } from './config/swagger';
import routes from './routes';
import { env } from './config/env';
import { cleanExpiredTokens } from './utils/jwt.util';




dotenv.config();

const app: Application = express();

const httpServer = createServer(app);

const io = initSocket(httpServer);

app.set('io', io);

app.use(corsMiddleware);
app.use(cookieParser());

app.use((req, res, next) => {
  if (req.originalUrl === '/api/stripe/webhook') {
    next();
  } else {
    express.json({ limit: '10mb' })(req, res, next);
  }
});

app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api', apiLimiter);

setupSwagger(app);

app.use('/api', routes);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Perfume Shop API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      docs: '/api-docs',
    },
  });
});

app.use(notFound);

app.use(errorHandler);

setInterval(() => {
  cleanExpiredTokens();
}, 60 * 60 * 1000);

// Запуск сервера
const PORT = env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`
                                                         
     🚀 Server is running on port ${PORT}                  
                                                         
     📡 Environment: ${env.NODE_ENV.toUpperCase().padEnd(18)}               
     🌐 API: http://localhost:${PORT}/api                  
     💬 Socket.IO: Connected                             
     ✅ Ready to accept requests                         
                                                         

  `);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason: Error) => {
  console.error('Unhandled Rejection:', reason);
  throw reason;
});

process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

export default app;