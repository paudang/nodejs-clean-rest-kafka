import { Server } from 'http';
import logger from '@/infrastructure/log/logger';

export const setupGracefulShutdown = (server: Server, kafkaService: { disconnect: () => Promise<void> }) => {
    const gracefulShutdown = async (signal: string) => {
        logger.info(`Received ${signal}. Shutting down gracefully...`);
        server.close(async () => {
            logger.info('HTTP server closed.');
            try {
                const sequelize = (await import('@/infrastructure/database/database')).default;
                await sequelize.close();
                logger.info('Database connection closed.');
                await kafkaService.disconnect();
                logger.info('Kafka connection closed.');
                logger.info('Graceful shutdown fully completed.');
                process.exit(0);
            } catch (err) {
                logger.error('Error during shutdown:', err);
                process.exit(1);
            }
        });

        setTimeout(() => {
            logger.error('Could not close connections in time, forcefully shutting down');
            process.exit(1);
        }, 15000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
};
