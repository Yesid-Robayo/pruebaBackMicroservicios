import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";

/**
 * JwtStrategy class that extends PassportStrategy to handle JWT authentication.
 * 
 * @class
 * @extends {PassportStrategy(Strategy)}
 * @implements {PassportStrategy}
 * 
 * @constructor
 * @param {ConfigService} configService - Service to access application configuration.
 * 
 * @description
 * This strategy extracts the JWT token from cookies and verifies it using the secret key
 * provided by the ConfigService. It also checks if the token has expired.
 * 
 * @method validate
 * @async
 * @param {any} payload - The decoded JWT payload.
 * @returns {Promise<{ userId: string, roleId: string }>} - Returns an object containing userId and roleId if validation is successful.
 * @throws {UnauthorizedException} - Throws an exception if the payload is invalid.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(configService: ConfigService) {

        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request) => req?.cookies?.token // Extrae el token desde cookies
            ]),
            secretOrKey: configService.get<string>('JWT_SECRET'),
            ignoreExpiration: false, // Verifica si el token expiró
        });
    }

    async validate(payload: any) {
        if (!payload) throw new UnauthorizedException();
        return { userId: payload.userId, roleId: payload.roleId };
    }
}
