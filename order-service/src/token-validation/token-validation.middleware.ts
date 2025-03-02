import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { KafkaService } from 'src/kafka/kafka.service';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to validate the token from the request cookies.
 * 
 * @class TokenValidationMiddleware
 * @implements {NestMiddleware}
 * 
 * @constructor
 * @param {KafkaService} kafkaService - The Kafka service used to send and receive messages.
 * 
 * @method use
 * @async
 * @param {Request} req - The incoming request object.
 * @param {Response} res - The outgoing response object.
 * @param {NextFunction} next - The next middleware function in the stack.
 * 
 * @throws {UnauthorizedException} If the token is not present in the cookies.
 * @throws {UnauthorizedException} If the user does not exist or there is an error validating the token.
 * 
 * @description
 * This middleware checks for the presence of a token in the request cookies. If the token is not present,
 * it throws an UnauthorizedException. It then sends the token to a Kafka topic to check if the user exists.
 * If the user does not exist or there is an error during validation, it throws an UnauthorizedException.
 * If the user exists, it calls the next middleware function in the stack.
 */
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