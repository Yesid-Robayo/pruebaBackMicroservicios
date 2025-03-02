import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

/**
 * AuthController   handles the authentication-related operations.
 *  */
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    /**
     * Handles user login.
     * @param loginDto - The login credentials containing email and password.
     * @param res - The response object used to send cookies and return status.
     * @returns A JSON response indicating whether login was successful or unauthorized.
     */
    @Post('login')
    @ApiOperation({ summary: 'Login' })
    @ApiResponse({ status: 200, description: 'Login successful' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async login(@Body() loginDto: LoginDto, @Res() res: Response) {
        try {
            const { email, password } = loginDto;
            const result = await this.authService.login(email, password);
            res.cookie('token', result, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: 60 * 60 * 1000, // 1 hour
            });
            return res.status(200).json({ code: 200, message: 'Login successful' });
        } catch (err) {
            return res.status(401).json({ code: 401, message: 'Unauthorized' });
        }
    }

    /**
     * Handles user logout by clearing the authentication cookie.
     * @param res - The response object used to clear cookies and return status.
     * @returns A JSON response indicating the logout was successful.
     */
    @Post('logout')
    @ApiOperation({ summary: 'Logout' })
    @ApiResponse({ status: 200, description: 'Logout successful' })
    async logout(@Res() res: Response) {
        res.clearCookie('token');
        return res.status(200).json({ code: 200, message: 'Logout successful' });
    }
}
