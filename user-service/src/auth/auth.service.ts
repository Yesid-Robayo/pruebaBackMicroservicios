import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/user/dto/create.user.dto';
import { UserService } from 'src/user/user.service';
import { Role } from 'src/utils/enum/enum';

@Injectable()
export class AuthService {
    constructor(private readonly jwtService: JwtService, private readonly userService: UserService) { }



    generateToken(userId: number, role: Role) {
        const payload = { userId, role };
        return this.jwtService.sign(payload);

    }


    verifyToken(token: string) {
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



    async login(email: string, password: string) {

        const validPassword = await this.userService.validateUser(email, password);
        if (!validPassword) {
            throw new Error('Invalid password');
        }

        const { id, role } = validPassword;
        const token = this.generateToken(id, role);
        return token;

    }


}
