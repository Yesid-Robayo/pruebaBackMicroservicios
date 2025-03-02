import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user-validation/user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create.user.dto';
import * as argon2 from 'argon2';
import { Role } from '@prisma/client';

describe('UserService', () => {
  let service: UserService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    /**
     * Creates a testing module for the UserService with a mocked PrismaService.
     * The PrismaService mock includes `findUnique` and `create` methods.
     * 
     * @returns {Promise<TestingModule>} A promise that resolves to the compiled testing module.
     */
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      const createUserDto: CreateUserDto = {
        email: 'yesid.robayo@example.com',
        password: 'yesid123',
        name: 'Yesid Robayo',
        role: Role.USER,
      };

      const hashPassword = await argon2.hash(createUserDto.password);

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prismaService.user, 'create').mockResolvedValue({
        id: 1,
        email: createUserDto.email,
        password: hashPassword,
        name: createUserDto.name,
        role: createUserDto.role,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.createUser(createUserDto);

      expect(result).toEqual({
        message: 'User created successfully',
        code: 201,
      });
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: createUserDto.email,
          password: expect.any(String),
          name: createUserDto.name,
          role: createUserDto.role,
        },
      });
    });

    it('should throw an error if email already exists', async () => {
      const createUserDto: CreateUserDto = {
        email: 'yesid.robayo@example.com',
        password: 'yesid123',
        name: 'Yesid Robayo',
        role: Role.USER,
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue({
        id: 1,
        email: createUserDto.email,
        password: 'hashedPassword',
        name: createUserDto.name,
        role: createUserDto.role,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(service.createUser(createUserDto)).rejects.toThrow('Email already exists');
    });

    it('should throw an error if role is invalid', async () => {
      const createUserDto: CreateUserDto = {
        email: 'yesid.robayo@example.com',
        password: 'yesid123',
        name: 'Yesid Robayo',
        role: 'INVALID_ROLE' as Role,
      };

      await expect(service.createUser(createUserDto)).rejects.toThrow('Invalid role');
    });
  });

  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      const email = 'yesid.robayo@example.com';
      const password = 'yesid123';
      const hashPassword = await argon2.hash(password);

      const user = {
        id: 1,
        email,
        password: hashPassword,
        name: 'Yesid Robayo',
        role: Role.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user);

      const result = await service.validateUser(email, password);

      expect(result).toEqual({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        updatedAt: user.updatedAt,
        createdAt: user.createdAt,
      });
    });

    it('should throw an error if user is not found', async () => {
      const email = 'yesid.robayo@example.com';
      const password = 'yesid123';

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(service.validateUser(email, password)).rejects.toThrow('User not found');
    });

    it('should throw an error if password is invalid', async () => {
      const email = 'yesid.robayo@example.com';
      const password = 'yesid123';
      const wrongPassword = 'wrongPassword';
      const hashPassword = await argon2.hash(password);

      const user = {
        id: 1,
        email,
        password: hashPassword,
        name: 'Yesid Robayo',
        role: Role.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user);

      await expect(service.validateUser(email, wrongPassword)).rejects.toThrow('Invalid password');
    });
  });

  describe('findByEmail', () => {
    it('should return user if found by email', async () => {
      const email = 'yesid.robayo@example.com';
      const user = {
        id: 1,
        email,
        password: 'hashedPassword',
        name: 'Yesid Robayo',
        role: Role.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user);

      const result = await service.findByEmail(email);

      expect(result).toEqual({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        updatedAt: user.updatedAt,
        createdAt: user.createdAt,
      });
    });

    it('should throw an error if user is not found by email', async () => {
      const email = 'yesid.robayo@example.com';

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(service.findByEmail(email)).rejects.toThrow('User not found');
    });
  });

  describe('findById', () => {
    it('should return user if found by id', async () => {
      const id = 1;
      const user = {
        id,
        email: 'yesid.robayo@example.com',
        password: 'hashedPassword',
        name: 'Yesid Robayo',
        role: Role.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user);

      const result = await service.findById(id);

      expect(result).toEqual({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        updatedAt: user.updatedAt,
        createdAt: user.createdAt,
      });
    });

    it('should throw an error if user is not found by id', async () => {
      const id = 1;

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(service.findById(id)).rejects.toThrow('User not found');
    });
  });

  describe('comproveRoleIdUser', () => {
    it('should return true if user role is USER', async () => {
      const id = 1;
      const user = {
        id,
        email: 'yesid.robayo@example.com',
        password: 'hashedPassword',
        name: 'Yesid Robayo',
        role: Role.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user);

      const result = await service.comproveRoleIdUser(id);

      expect(result).toBe(true);
    });

    it('should return false if user role is not USER', async () => {
      const id = 1;
      const user = {
        id,
        email: 'yesid.robayo@example.com',
        password: 'hashedPassword',
        name: 'Yesid Robayo',
        role: Role.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user);

      const result = await service.comproveRoleIdUser(id);

      expect(result).toBe(false);
    });

    it('should throw an error if user is not found', async () => {
      const id = 1;

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(service.comproveRoleIdUser(id)).rejects.toThrow('User not found');
    });
  });
});