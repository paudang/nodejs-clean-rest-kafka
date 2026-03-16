import { BaseConsumer } from '@/interfaces/messaging/baseConsumer';
import logger from '@/infrastructure/log/logger';
import { UserEventSchema } from '@/interfaces/messaging/schemas/userEventSchema';

export class WelcomeEmailConsumer extends BaseConsumer {
  topic = 'user-topic';
  groupId = 'welcome-email-group';

  async handle(data: unknown) {
    const result = UserEventSchema.safeParse(data);
    
    if (!result.success) {
      logger.error('[Kafka] Invalid user event data:', result.error.format());
      return;
    }

    const { action, payload } = result.data;

    if (action === 'USER_CREATED') {
      logger.info(`[Kafka] Consumer: Received USER_CREATED.`);
      logger.info(`[Kafka] Consumer: 📧 Sending welcome email to '${payload.email}'... Done!`);
      // In a real app, you would call an EmailService here
    }
  }
}
