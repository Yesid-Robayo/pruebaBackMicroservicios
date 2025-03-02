import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from '../user-validation/user.service';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from './dto/create.user.dto';
import { UserResponseDto } from './dto/user.response.dto';
import { Request, Response } from 'express';
import { Role } from '@prisma/client';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;
  let authService: AuthService;

  beforeEach(async () => {
    /**
     * Creates a testing module for the UserController with mocked dependencies.
     * 
     * The module includes:
     * - `UserController` as the controller to be tested.
     * - `UserService` as a provider with mocked methods `createUser` and `findById`.
     * - `AuthService` as a provider with a mocked method `verifyToken`.
     * 
     * @returns {Promise<TestingModule>} A promise that resolves to the compiled testing module.
     */
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

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      const createUserDto: CreateUserDto = {
        email: 'yesid.robayo@example.com',
        password: 'yesid123',
        name: 'Yesid Robayo',
        role: Role.USER,
      };

      const result = { code: 201, message: 'User created successfully' };
      jest.spyOn(userService, 'createUser').mockResolvedValue(result);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await controller.createUser(createUserDto, res);

      expect(userService.createUser).toHaveBeenCalledWith(createUserDto);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(result);
    });

    it('should handle invalid role', async () => {
      const createUserDto: CreateUserDto = {
        email: 'yesid.robayo@example.com',
        password: 'yesid123',
        name: 'Yesid Robayo',
        role: 'INVALID_ROLE' as Role,
      };

      jest.spyOn(userService, 'createUser').mockRejectedValue(new Error('Invalid role'));

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await controller.createUser(createUserDto, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ code: 400, message: 'Invalid role only ADMIN - USER' });
    });

    it('should handle email already exists', async () => {
      const createUserDto: CreateUserDto = {
        email: 'yesid.robayo@example.com',
        password: 'yesid123',
        name: 'Yesid Robayo',
        role: 'USER',
      };

      jest.spyOn(userService, 'createUser').mockRejectedValue(new Error('Email already exists'));

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await controller.createUser(createUserDto, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ code: 400, message: 'Email already exists' });
    });

    it('should handle internal server error', async () => {
      const createUserDto: CreateUserDto = {
        email: 'yesid.robayo@example.com',
        password: 'yesid123',
        name: 'Yesid Robayo',
        role: 'USER',
      };

      jest.spyOn(userService, 'createUser').mockRejectedValue(new Error('Internal server error'));

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await controller.createUser(createUserDto, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ code: 500, message: 'Internal server error' });
    });
  });

  describe('me', () => {
    it('should return user information', async () => {
      const token = 'valid-token';
      const decoded = { userId: 1 };
      const user: UserResponseDto = {
        id: 1,
        email: 'yesid.robayo@example.com',
        name: 'Yesid Robayo',
        role: 'USER',
        updatedAt: new Date(),
        createdAt: new Date(),
      };

      jest.spyOn(authService, 'verifyToken').mockResolvedValue(decoded);
      jest.spyOn(userService, 'findById').mockResolvedValue(user);

      const req = {
        cookies: { token },
      } as unknown as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await controller.me(req, res);

      expect(authService.verifyToken).toHaveBeenCalledWith(token);
      expect(userService.findById).toHaveBeenCalledWith(decoded.userId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ code: 200, data: user });
    });

    it('should handle unauthorized when token is missing', async () => {
      const req = {
        cookies: {},
      } as unknown as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await controller.me(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ code: 401, message: 'Unauthorized' });
    });

    it('should handle unauthorized when token is invalid', async () => {
      const token = 'invalid-token';

      jest.spyOn(authService, 'verifyToken').mockResolvedValue(null);

      const req = {
        cookies: { token },
      } as unknown as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await controller.me(req, res);

      expect(authService.verifyToken).toHaveBeenCalledWith(token);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ code: 401, message: 'Unauthorized' });
    });

    it('should handle internal server error', async () => {
      const token = 'valid-token';

      jest.spyOn(authService, 'verifyToken').mockRejectedValue(new Error('Internal server error'));

      const req = {
        cookies: { token },
      } as unknown as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await controller.me(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ code: 500, message: 'Internal server error' });
    });
  });
});