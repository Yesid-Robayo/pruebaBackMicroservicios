import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';

describe('AuthController', () => {
  let app: INestApplication;
  let authService: AuthService;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn().mockResolvedValue('mocked-token'),
          },
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    authService = moduleRef.get<AuthService>(AuthService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/login', () => {
    it('should login successfully and set cookie', async () => {
      const loginDto: LoginDto = { email: 'test@example.com', password: 'password123' };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(200);

      expect(response.body).toEqual({ code: 200, message: 'Login successful' });
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should return 401 if login fails', async () => {
      jest.spyOn(authService, 'login').mockRejectedValueOnce(new Error('Unauthorized'));

      const loginDto: LoginDto = { email: 'wrong@example.com', password: 'wrongpass' };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(401);

      expect(response.body).toEqual({ code: 401, message: 'Unauthorized' });
    });
  });

  describe('POST /auth/logout', () => {
    it('should clear the token cookie and return 200', async () => {
      const response = await request(app.getHttpServer()).post('/auth/logout').expect(200);
      
      expect(response.body).toEqual({ code: 200, message: 'Logout successful' });
      expect(response.headers['set-cookie']).toBeDefined();
    });
  });
});
