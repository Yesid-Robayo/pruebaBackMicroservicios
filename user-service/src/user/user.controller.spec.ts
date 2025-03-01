import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from './dto/create.user.dto';
import { Response } from 'express';
import { Role } from 'src/utils/enum/enum';


describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;
  let authService: AuthService;

  const mockResponse = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res as Response;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            createUser: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            verifyToken: jest.fn(),
          },
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
    authService = module.get<AuthService>(AuthService);
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: Role.USER,
      };
      const mockRes = mockResponse();

      (userService.createUser as jest.Mock).mockResolvedValue({
        code: 201,
        message: 'User created successfully',
      });

      await userController.createUser(createUserDto, mockRes);

      expect(userService.createUser).toHaveBeenCalledWith(createUserDto);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        code: 201,
        message: 'User created successfully',
      });
    });

    it('should handle internal server error', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: Role.USER,
      };
      const mockRes = mockResponse();

      (userService.createUser as jest.Mock).mockRejectedValue(new Error('Database error'));

      await userController.createUser(createUserDto, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        code: 500,
        message: 'Internal server error',
      });
    });
  });

  describe('me', () => {
    it('should return user information if authenticated', async () => {
      const mockReq = {
        cookies: { token: 'valid-token' },
      } as any;
      const mockRes = mockResponse();

      (authService.verifyToken as jest.Mock).mockResolvedValue({ userId: 1 });
      (userService.findById as jest.Mock).mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
      });

      await userController.me(mockReq, mockRes);

      expect(authService.verifyToken).toHaveBeenCalledWith('valid-token');
      expect(userService.findById).toHaveBeenCalledWith(1);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        code: 200,
        data: {
          id: 1,
          email: 'test@example.com',
          name: 'Test User',
        },
      });
    });

    it('should return 401 if no token is provided', async () => {
      const mockReq = {
        cookies: {},
      } as any;
      const mockRes = mockResponse();

      await userController.me(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        code: 401,
        message: 'Unauthorized',
      });
    });

    it('should return 401 if token verification fails', async () => {
      const mockReq = {
        cookies: { token: 'invalid-token' },
      } as any;
      const mockRes = mockResponse();


      await userController.me(mockReq, mockRes);
     
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        code: 401,
        message: 'Unauthorized',
      });
    });

    it('should handle internal server error', async () => {
      const mockReq = {
        cookies: { token: 'valid-token' },
      } as any;
      const mockRes = mockResponse();

      (authService.verifyToken as jest.Mock).mockResolvedValue({ userId: 1 });
      (userService.findById as jest.Mock).mockRejectedValue(new Error('Database error'));

      await userController.me(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        code: 500,
        message: 'Internal server error',
      });
    });
  });
});
