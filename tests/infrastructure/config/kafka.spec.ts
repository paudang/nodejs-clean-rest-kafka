import { Kafka } from 'kafkajs';

jest.mock('kafkajs', () => {
    return {
        Kafka: jest.fn().mockImplementation(() => ({
            producer: jest.fn(),
            consumer: jest.fn(),
        })),
    };
});

describe('Kafka Configuration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should initialize Kafka', () => {
        require('@/infrastructure/config/kafka');
        expect(Kafka).toHaveBeenCalled();
    });
});
