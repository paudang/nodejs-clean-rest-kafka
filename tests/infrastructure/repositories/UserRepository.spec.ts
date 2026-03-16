import { UserRepository } from '@/infrastructure/repositories/UserRepository';
import UserModel from '@/infrastructure/database/models/User';

// Mock DB Model Database Layer
jest.mock('@/infrastructure/database/models/User');

describe('UserRepository', () => {
    let userRepository: UserRepository;

    beforeEach(() => {
        userRepository = new UserRepository();
        jest.clearAllMocks();
    });

    describe('save', () => {
        it('should save and return a newly created user (Happy Path)', async () => {
            // Arrange
            const payload = { id: '', name: 'TestUser', email: 'test@example.com' };
            const mockDbRecord = { id: '1', name: 'TestUser', email: 'test@example.com' };
            (UserModel.create as jest.Mock).mockResolvedValue(mockDbRecord);

            // Act
            const result = await userRepository.save(payload);

            // Assert
            expect(result).toEqual({ id: '1', name: 'TestUser', email: 'test@example.com' });
            expect(UserModel.create).toHaveBeenCalledWith({ name: payload.name, email: payload.email });
        });

        it('should throw an error when DB fails explicitly (Edge Case)', async () => {
            // Arrange
            const payload = { id: '', name: 'FailUser', email: 'fail@example.com' };
            const error = new Error('DB Connection Refused');
            (UserModel.create as jest.Mock).mockRejectedValue(error);

            // Act & Assert
            await expect(userRepository.save(payload)).rejects.toThrow(error);
        });
    });

    describe('getUsers', () => {
        it('should return a list of mapped UserEntities (Happy Path)', async () => {
            // Arrange
            const mockDbRecords = [{ id: '1', name: 'User1', email: 'user1@example.com' }];
            (UserModel.findAll as jest.Mock).mockResolvedValue(mockDbRecords);

            // Act
            const result = await userRepository.getUsers();

            // Assert
            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({ id: '1', name: 'User1', email: 'user1@example.com' });
            expect(UserModel.findAll).toHaveBeenCalled();
        });
    });
});
