import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/user/dto/create.user.dto';
import { UserService } from 'src/user-validation/user.service';
import { Role } from '@prisma/client';

/**
 * AuthService is responsible for handling authentication-related operations.
 * It provides methods to generate and verify JWT tokens, and to handle user login.
 */
@Injectable()
export class AuthService {
    /**
     * Constructs an instance of AuthService.
     * @param jwtService - The JWT service used for token operations.
     * @param userService - The user service used for user validation.
     */
    constructor(private readonly jwtService: JwtService, private readonly userService: UserService) { }

    /**
     * Generates a JWT token for a given user ID and role.
     * @param userId - The ID of the user.
     * @param role - The role of the user.
     * @returns The generated JWT token.
     */
    generateToken(userId: number, role: Role): string {
        const payload = { userId, role };
        return this.jwtService.sign(payload);
    }

    /**
     * Verifies a given JWT token.
     * @param token - The JWT token to verify.
     * @returns The decoded token payload if the token is valid.
     * @throws Error if the token is expired, invalid, or verification fails.
     */
    verifyToken(token: string): any {
        try {
            return this.jwtService.verify(token); 
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                throw new Error('Token expired');
            }
            if (err.name === 'JsonWebTokenError') {
                throw new Error('Invalid token');
            }
            throw new Error('Token verification failed');
        }
    }

    /**
     * Handles user login by validating the user's email and password.
     * If valid, generates and returns a JWT token for the user.
     * @param email - The email of the user.
     * @param password - The password of the user.
     * @returns The generated JWT token.
     * @throws Error if the password is invalid.
     */
    async login(email: string, password: string): Promise<string> {
        const validPassword = await this.userService.validateUser(email, password);
        if (!validPassword) {
            throw new Error('Invalid password');
        }

        const { id, role } = validPassword;
        const token = this.generateToken(id, role);
        return token;
    }
}



