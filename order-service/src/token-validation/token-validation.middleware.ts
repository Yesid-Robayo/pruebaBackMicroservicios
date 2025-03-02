import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { KafkaService } from 'src/kafka/kafka.service';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TokenValidationMiddleware implements NestMiddleware {
  constructor(private readonly kafkaService: KafkaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies.token;
    if (!token) {
      throw new UnauthorizedException('Token is required');
    }

    try {
      // Usar el patrón request-response para validar el token
      const response = await this.kafkaService.sendAndReceive(
        'check_user_exists',
        { token },
        'token_validation_response',
        5000 // timeout de 5 segundos
      );

      console.log('Response from user-service:', response);
      if (!response || !response.userExists) {
        throw new UnauthorizedException('User does not exist');
      }

      next();
    } catch (error) {
      throw new UnauthorizedException('Error validating token');
    }
  }
}