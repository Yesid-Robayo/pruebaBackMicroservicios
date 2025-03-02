import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';

describe('AuthController', () => {
    let authController: AuthController;
    let authService: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: {
                        login: jest.fn(),
                    },
                },
            ],
        }).compile();

        authController = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);
    });

    describe('login', () => {
        it('should return 200 and set cookie on successful login', async () => {
            const loginDto: LoginDto = {
                email: 'yesid.robayo@example.com',
                password: 'yesid123',
            };

            const mockToken = 'mockToken';
            const mockResponse = {
                cookie: jest.fn(),
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;

            jest.spyOn(authService, 'login').mockResolvedValue(mockToken);

            await authController.login(loginDto, mockResponse);

            expect(authService.login).toHaveBeenCalledWith(loginDto.email, loginDto.password);
            expect(mockResponse.cookie).toHaveBeenCalledWith('token', mockToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: 60 * 60 * 1000,
            });
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({ code: 200, message: 'Login successful' });
        });

        it('should return 401 on failed login', async () => {
            const loginDto: LoginDto = {
                email: 'yesid.robayo@example.com',
                password: 'wrongpassword',
            };

            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;

            jest.spyOn(authService, 'login').mockRejectedValue(new Error('Unauthorized'));

            await authController.login(loginDto, mockResponse);

            expect(authService.login).toHaveBeenCalledWith(loginDto.email, loginDto.password);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ code: 401, message: 'Unauthorized' });
        });
    });

    describe('logout', () => {
        it('should clear the token cookie and return 200', async () => {
            const mockResponse = {
                clearCookie: jest.fn(),
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;

            await authController.logout(mockResponse);

            expect(mockResponse.clearCookie).toHaveBeenCalledWith('token');
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({ code: 200, message: 'Logout successful' });
        });
    });
});