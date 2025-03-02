import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { KafkaService } from 'src/kafka/kafka.service';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TokenValidationMiddleware implements NestMiddleware {
  constructor(private readonly kafkaService: KafkaService) { }

  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies.token;
    if (!token) {
      throw new UnauthorizedException('Token is required');
    }

    try {

      const response = await this.kafkaService.sendAndReceive(
        'check_user_exists',
        { token },
        'token_validation_response',
        5000 
      );

      if (!response || !response.userExists) {
        throw new UnauthorizedException('User does not exist');
      }
      next();
    } catch (error) {
      throw new UnauthorizedException('Error validating token');
    }
  }
}