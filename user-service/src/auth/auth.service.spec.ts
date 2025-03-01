import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { Role } from 'src/utils/enum/enum';

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mocked-jwt-token'),
            verify: jest.fn().mockImplementation((token) => {
              if (token === 'valid-token') return { userId: 1, role: Role.USER };
              if (token === 'expired-token') throw { name: 'TokenExpiredError' };
              if (token === 'invalid-token') throw { name: 'JsonWebTokenError' };
              throw new Error('Unknown error');
            }),
          },
        },
        {
          provide: UserService,
          useValue: {
            validateUser: jest.fn().mockImplementation((email, password) => {
              if (email === 'valid@example.com' && password === 'password123') {
                return { id: 1, role: Role.USER };
              }
              return null;
            }),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    userService = module.get<UserService>(UserService);
  });

  describe('generateToken', () => {
    it('should return a JWT token', () => {
      const token = authService.generateToken(1, Role.USER);
      expect(token).toBe('mocked-jwt-token');
    });
  });

  describe('verifyToken', () => {
    it('should return payload for a valid token', () => {
      expect(authService.verifyToken('valid-token')).toEqual({ userId: 1, role: Role.USER });
    });

    it('should throw "Token expired" error for expired token', () => {
      expect(() => authService.verifyToken('expired-token')).toThrow('Token expired');
    });

    it('should throw "Invalid token" error for invalid token', () => {
      expect(() => authService.verifyToken('invalid-token')).toThrow('Invalid token');
    });

    it('should throw "Token verification failed" for unknown errors', () => {
      expect(() => authService.verifyToken('unknown-token')).toThrow('Token verification failed');
    });
  });

  describe('login', () => {
    it('should return a token for valid credentials', async () => {
      const token = await authService.login('valid@example.com', 'password123');
      expect(token).toBe('mocked-jwt-token');
    });

    it('should throw "Invalid password" for incorrect credentials', async () => {
      await expect(authService.login('invalid@example.com', 'wrongpassword')).rejects.toThrow('Invalid password');
    });
  });
});
