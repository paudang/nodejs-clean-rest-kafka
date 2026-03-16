import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '@/utils/httpCodes';
import { UserController } from '@/interfaces/controllers/userController';
import CreateUser from '@/usecases/createUser';
import GetAllUsers from '@/usecases/getAllUsers';

// Mock dependencies
jest.mock('@/infrastructure/repositories/UserRepository');
jest.mock('@/usecases/createUser');
jest.mock('@/usecases/getAllUsers');
jest.mock('@/infrastructure/log/logger');
jest.mock('@/infrastructure/messaging/kafkaClient', () => {
    const mockSendMessage = jest.fn().mockResolvedValue(undefined);
    return {
        kafkaService: {
            sendMessage: mockSendMessage
        },
        KafkaService: jest.fn().mockImplementation(() => ({
            sendMessage: mockSendMessage
        }))
    };
});


describe('UserController (Clean Architecture)', () => {
    let userController: UserController;
    let mockCreateUserUseCase: jest.Mocked<CreateUser>;
    let mockGetAllUsersUseCase: jest.Mocked<GetAllUsers>;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
        // Clear all mocks
        jest.clearAllMocks();

        userController = new UserController();

        // Retrieve the mocked instances created inside UserController constructor
        mockCreateUserUseCase = (CreateUser as jest.Mock).mock.instances[0] as jest.Mocked<CreateUser>;
        mockGetAllUsersUseCase = (GetAllUsers as jest.Mock).mock.instances[0] as jest.Mocked<GetAllUsers>;

        mockRequest = {};
        mockResponse = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
        };
        mockNext = jest.fn();
    });

    describe('getUsers', () => {
        it('should return successfully (Happy Path)', async () => {
            // Arrange
            const usersMock = [{ id: '1', name: 'Test', email: 'test@example.com' }];
            mockGetAllUsersUseCase.execute.mockResolvedValue(usersMock);

            // Act
            await userController.getUsers(mockRequest as Request, mockResponse as Response, mockNext);

            // Assert
            expect(mockResponse.json).toHaveBeenCalledWith(usersMock);
            expect(mockGetAllUsersUseCase.execute).toHaveBeenCalled();
        });

        it('should handle errors correctly (Error Handling)', async () => {
            // Arrange
            const error = new Error('UseCase Error');
            mockGetAllUsersUseCase.execute.mockRejectedValue(error);

            // Act & Assert
            await userController.getUsers(mockRequest as Request, mockResponse as Response, mockNext);
            expect(mockNext).toHaveBeenCalledWith(error);
        });

        it('should handle non-Error objects in catch block', async () => {
            // Arrange
            const error = 'String Error';
            mockGetAllUsersUseCase.execute.mockRejectedValue(error);

            // Act & Assert
            await userController.getUsers(mockRequest as Request, mockResponse as Response, mockNext);
            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('createUser', () => {
        it('should successfully create a new user (Happy Path)', async () => {
            // Arrange
            const payload = { name: 'Alice', email: 'alice@example.com' };
            mockRequest.body = payload;
            const expectedUser = { id: '1', ...payload };
            
            mockCreateUserUseCase.execute.mockResolvedValue(expectedUser);

            // Act
            await userController.createUser(mockRequest as Request, mockResponse as Response, mockNext);

            // Assert
            const { kafkaService } = require('@/infrastructure/messaging/kafkaClient');
            expect(kafkaService.sendMessage).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS.CREATED);

            expect(mockResponse.json).toHaveBeenCalledWith(expectedUser);
            expect(mockCreateUserUseCase.execute).toHaveBeenCalledWith(payload.name, payload.email);
        });

        it('should handle errors when creation fails (Error Handling)', async () => {
            // Arrange
            const error = new Error('Creation Error');
            const payload = { name: 'Bob', email: 'bob@example.com' };
            mockRequest.body = payload;

            mockCreateUserUseCase.execute.mockRejectedValue(error);

            // Act & Assert
            await userController.createUser(mockRequest as Request, mockResponse as Response, mockNext);
            expect(mockNext).toHaveBeenCalledWith(error);
        });

        it('should handle non-Error objects in catch block when creation fails', async () => {
            // Arrange
            const error = 'Creation String Error';
            const payload = { name: 'Bob', email: 'bob@example.com' };
            mockRequest.body = payload;

            mockCreateUserUseCase.execute.mockRejectedValue(error);

            // Act & Assert
            await userController.createUser(mockRequest as Request, mockResponse as Response, mockNext);
            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });
});
