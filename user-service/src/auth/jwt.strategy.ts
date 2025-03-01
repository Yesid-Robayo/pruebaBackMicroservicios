import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(configService: ConfigService) {
        console.log("JWT_SECRET en Strategy:", configService.get<string>('JWT_SECRET')); // Verifica si se carga correctamente

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
