import { Router, Request, Response } from 'express';
import logger from '@/infrastructure/log/logger';
import { HTTP_STATUS } from '@/utils/httpCodes';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const healthData: Record<string, unknown> = {
    status: 'UP',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: 'disconnected',
    timestamp: Date.now()
  };
  logger.info('Health Check');

  try {
    const sequelize = (await import('@/infrastructure/database/database')).default;
    await sequelize.authenticate();
    healthData.database = 'connected';
  } catch (err) {
    healthData.database = 'error';
    healthData.status = 'DOWN';
    logger.error('Health Check Database Ping Failed:', err);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(healthData);
  }

  res.status(HTTP_STATUS.OK).json(healthData);
});

export default router;
