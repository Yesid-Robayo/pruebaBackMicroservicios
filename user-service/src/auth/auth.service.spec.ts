import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user-validation/user.service';
import { AuthService } from './auth.service';
import { Role } from '@prisma/client';

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
                        sign: jest.fn(),
                        verify: jest.fn(),
                    },
                },
                {
                    provide: UserService,
                    useValue: {
                        validateUser: jest.fn(),
                    },
                },
            ],
        }).compile();

        authService = module.get<AuthService>(AuthService);
        jwtService = module.get<JwtService>(JwtService);
        userService = module.get<UserService>(UserService);
    });

    describe('generateToken', () => {
        it('should generate a token with the correct payload', () => {
            const userId = 1;
            const role = Role.USER;
            const mockToken = 'mockToken';

            jest.spyOn(jwtService, 'sign').mockReturnValue(mockToken);

            const result = authService.generateToken(userId, role);

            expect(jwtService.sign).toHaveBeenCalledWith({ userId, role });
            expect(result).toBe(mockToken);
        });
    });

    describe('verifyToken', () => {
        it('should verify a valid token', () => {
            const mockToken = 'mockToken';
            const mockPayload = { userId: 1, role: Role.USER };

            jest.spyOn(jwtService, 'verify').mockReturnValue(mockPayload);

            const result = authService.verifyToken(mockToken);

            expect(jwtService.verify).toHaveBeenCalledWith(mockToken);
            expect(result).toEqual(mockPayload);
        });

        it('should throw an error if the token is expired', () => {
            const mockToken = 'expiredToken';

            jest.spyOn(jwtService, 'verify').mockImplementation(() => {
                throw { name: 'TokenExpiredError' };
            });

            expect(() => authService.verifyToken(mockToken)).toThrow('Token expired');
        });

        it('should throw an error if the token is invalid', () => {
            const mockToken = 'invalidToken';

            jest.spyOn(jwtService, 'verify').mockImplementation(() => {
                throw { name: 'JsonWebTokenError' };
            });

            expect(() => authService.verifyToken(mockToken)).toThrow('Invalid token');
        });

        it('should throw a generic error if token verification fails', () => {
            const mockToken = 'invalidToken';

            jest.spyOn(jwtService, 'verify').mockImplementation(() => {
                throw new Error('Token verification failed');
            });

            expect(() => authService.verifyToken(mockToken)).toThrow('Token verification failed');
        });
    });

    describe('login', () => {
        it('should return a token if login is successful', async () => {
            const email = 'yesid.robayo@example.com';
            const password = 'yesid123';
            const mockUser = { id: 1, role: Role.USER, email: 'test@example.com', name: 'Test User', updatedAt: new Date(), createdAt: new Date() };
            const mockToken = 'mockToken';

            jest.spyOn(userService, 'validateUser').mockResolvedValue(mockUser);
            jest.spyOn(authService, 'generateToken').mockReturnValue(mockToken);

            const result = await authService.login(email, password);

            expect(userService.validateUser).toHaveBeenCalledWith(email, password);
            expect(authService.generateToken).toHaveBeenCalledWith(mockUser.id, mockUser.role);
            expect(result).toBe(mockToken);
        });

        it('should throw an error if the password is invalid', async () => {
            const email = 'yesid.robayo@example.com';
            const password = 'wrongpassword';

            jest.spyOn(userService, 'validateUser').mockResolvedValue(null);

            await expect(authService.login(email, password)).rejects.toThrow('Invalid password');
        });
    });
});