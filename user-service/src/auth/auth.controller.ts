import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthResponseDto } from './dto/auth-response.dto';
import { Response } from 'express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @ApiOperation({ summary: 'Login' })
    @ApiResponse({ status: 200, description: 'Login successful'})
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async login(@Body() loginDto: LoginDto, @Res() res: Response) {
        try {
            const { email, password } = loginDto;
            const result = await this.authService.login(email, password);
            res.cookie('token', result, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: 60 * 60 * 1000,

            });
            return res.status(200).json({ code: 200, message: 'Login successful' });
        } catch (err) {
            console.log(err);
            return res.status(401).json({ code: 401, message: 'Unauthorized' });
        }
    }

    @Post('logout')
    @ApiOperation({ summary: 'Logout' })
    @ApiResponse({ status: 200, description: 'Logout successful' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async logout(@Res() res: Response) {

        res.clearCookie('token');
        return res.status(200).json({ code: 200, message: 'Logout successful' });


    }

}
