import { kafka } from '@/infrastructure/config/kafka';
import { EachMessagePayload, Producer, Consumer } from 'kafkajs';
import logger from '@/infrastructure/log/logger';

export class KafkaService {
    private producer: Producer;
    private consumer: Consumer;
    private isConnected = false;
    private connectionPromise: Promise<void> | null = null;

    constructor() {
        this.producer = kafka.producer();
        this.consumer = kafka.consumer({ groupId: 'test-group' });
    }

    async connect(retries = 10) {
        if (this.connectionPromise) return this.connectionPromise;

        this.connectionPromise = (async () => {
            let attempt = 0;
            while (attempt < retries) {
                try {
                    await this.producer.connect();
                    await this.consumer.connect();
                    logger.info('[Kafka] Producer connected successfully');
                    logger.info('[Kafka] Consumer connected successfully');
                    this.isConnected = true;

                    // Auto-register WelcomeEmailConsumer if it exists
                    try {
                        const { WelcomeEmailConsumer } = await import('@/interfaces/messaging/consumers/instances/welcomeEmailConsumer');
                        const welcomeConsumer = new WelcomeEmailConsumer();
                        await this.consumer.subscribe({ topic: welcomeConsumer.topic, fromBeginning: true });
                        logger.info(`[Kafka] Registered consumer for topic: ${welcomeConsumer.topic}`);
                        
                        await this.consumer.run({
                            eachMessage: async (payload) => welcomeConsumer.onMessage(payload),
                        });
                    } catch (e) {
                        // Fallback or no consumers found
                        logger.warn(`[Kafka] Could not load WelcomeEmailConsumer, using fallback: ${(e as Error).message}`);
                        await this.consumer.subscribe({ topic: 'user-topic', fromBeginning: true });
                        await this.consumer.run({
                            eachMessage: async ({ message }: EachMessagePayload) => {
                                logger.info(`[Kafka] Consumer: Received message on user-topic: ${message.value?.toString()}`);
                            },
                        });
                    }
                    return;
                } catch (error) {
                    attempt++;
                    logger.error(`[Kafka] Connection attempt ${attempt} failed:`, (error as Error).message);
                    if (attempt >= retries) {
                        throw error;
                    }
                    await new Promise(res => setTimeout(res, 3000));
                }
            }
        })();

        return this.connectionPromise;
    }

    async sendMessage(topic: string, message: string) {
        if (this.connectionPromise) {
            await this.connectionPromise;
        }

        if (!this.isConnected) {
            throw new Error('[Kafka] Producer not connected. Check logs for connection errors.');
        }

        await this.producer.send({
            topic,
            messages: [
                { value: message },
            ],
        });
        try {
            const parsed = JSON.parse(message);
            logger.info(`[Kafka] Producer: Sent ${parsed.action} event for '${parsed.payload?.email || 'unknown'}'`);
        } catch {
            logger.info(`[Kafka] Producer: Sent message to ${topic}`);
        }
    }

    async disconnect() {
        await this.producer.disconnect();
        await this.consumer.disconnect();
    }
}

export const kafkaService = new KafkaService();
