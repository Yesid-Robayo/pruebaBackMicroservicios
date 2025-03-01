import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create.user.dto';
import * as argon2 from 'argon2';
import { Role } from 'src/utils/enum/enum';

describe('UserService', () => {
  let service: UserService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('createUser', () => {
    it('should throw an error if role is invalid', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password',
        name: 'Test User',
        role: 'INVALID_ROLE' as any,
      };

      await expect(service.createUser(createUserDto)).rejects.toThrow(
        'Invalid role. Only USER and ADMIN are allowed.',
      );
    });

    it('should throw an error if email already exists', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password',
        name: 'Test User',
        role: Role.USER,
      };

      mockPrismaService.user.findUnique.mockResolvedValueOnce({
        email: 'test@example.com',
      });

      await expect(service.createUser(createUserDto)).rejects.toThrow(
        'Email already exists',
      );
    });

    it('should create a user successfully', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password',
        name: 'Test User',
        role: Role.USER,
      };

      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.user.create.mockResolvedValueOnce({});

      const result = await service.createUser(createUserDto);

      expect(result).toEqual({
        message: 'User created successfully',
        code: 201,
      });
    });
  });

  describe('validateUser', () => {
    it('should throw an error if user is not found', async () => {
      const email = 'test@example.com';
      const password = 'password';

      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);

      await expect(service.validateUser(email, password)).rejects.toThrow(
        'User not found',
      );
    });

    it('should throw an error if password is invalid', async () => {
      const email = 'test@example.com';
      const password = 'password';

      mockPrismaService.user.findUnique.mockResolvedValueOnce({
        password: 'hashedPassword',
      });
      jest.spyOn(argon2, 'verify').mockResolvedValueOnce(false);

      await expect(service.validateUser(email, password)).rejects.toThrow(
        'Invalid password',
      );
    });

    it('should return user data if password is valid', async () => {
      const email = 'test@example.com';
      const password = 'password';

      mockPrismaService.user.findUnique.mockResolvedValueOnce({
        id: 1,
        email,
        name: 'Test User',
        password: 'hashedPassword',
        role: Role.USER,
        createdAt: new Date(),
      });
      jest.spyOn(argon2, 'verify').mockResolvedValueOnce(true);

      const result = await service.validateUser(email, password);

      expect(result).toEqual({
        id: 1,
        email,
        name: 'Test User',
        role: Role.USER,
        createdAt: expect.any(Date),
      });
    });
  });

  describe('findByEmail', () => {
    it('should throw an error if user is not found', async () => {
      const email = 'test@example.com';

      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);

      await expect(service.findByEmail(email)).rejects.toThrow(
        'User not found',
      );
    });

    it('should return user data if user is found', async () => {
      const email = 'test@example.com';

      mockPrismaService.user.findUnique.mockResolvedValueOnce({
        id: 1,
        email,
        name: 'Test User',
        role: Role.USER,
        createdAt: new Date(),
      });

      const result = await service.findByEmail(email);

      expect(result).toEqual({
        id: 1,
        email,
        name: 'Test User',
        role: Role.USER,
        createdAt: expect.any(Date),
      });
    });
  });

  describe('findById', () => {
    it('should throw an error if user is not found', async () => {
      const id = 1;

      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);

      await expect(service.findById(id)).rejects.toThrow('User not found');
    });

    it('should return user data if user is found', async () => {
      const id = 1;

      mockPrismaService.user.findUnique.mockResolvedValueOnce({
        id,
        email: 'test@example.com',
        name: 'Test User',
        role: Role.USER,
        createdAt: new Date(),
      });

      const result = await service.findById(id);

      expect(result).toEqual({
        id,
        email: 'test@example.com',
        name: 'Test User',
        role: Role.USER,
        createdAt: expect.any(Date),
      });
    });
  });
});
