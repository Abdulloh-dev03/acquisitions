import express, { Request, Response } from 'express';
import logger from '#config/logger.js';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouter from '#routes/auth.routes.js';
import usersRouter from '#routes/users.routes.js';
import securityMiddleware from '#middlewares/security.middleware.js';

const app = express();

app.use(helmet());

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  morgan('combined', {
    stream: { write: (message: string) => logger.info(message.trim()) },
  })
);

app.use(securityMiddleware);

app.get('/', (_req: Request, res: Response) => {
  logger.info('Hello from Acquisitions!');
  res.status(200).send('Hello from Acquisitions!');
});

app.get('/health', (_req: Request, res: Response) => {
  res
    .status(200)
    .json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
});

app.get('/api', (_req: Request, res: Response) => {
  res.status(200).json({ message: 'Acquisitions API is running!' });
});

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);

export default app;
