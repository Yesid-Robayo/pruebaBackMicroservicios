import { Body, Controller, Get, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user-validation/user.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create.user.dto';
import { Request, Response } from 'express';
import { UserResponseDto } from './dto/user.response.dto';
import { AuthService } from 'src/auth/auth.service';

@ApiTags('User')
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService, private readonly authService: AuthService) { }

    @Post('createUser')
    @ApiOperation({ summary: 'Create user' })
    @ApiResponse({ status: 201, description: 'User created successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 500, description: 'Internal server error ' })
    async createUser(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
        try {
            const result = await this.userService.createUser(createUserDto);
            return res.status(result.code).json({ code: result.code, message: result.message });
        } catch (err) {
            if (err.message === 'Invalid role') {
                return res.status(400).json({ code: 400, message: 'Invalid role only ADMIN - USER' });
            }
            if (err.message === 'Email already exists') {
                return res.status(400).json({ code: 400, message: 'Email already exists' });
            }
            return res.status(500).json({ code: 500, message: 'Internal server error' });
        }

    }
    @Get('me')
    @ApiOperation({ summary: 'User information' })
    @ApiResponse({ status: 200, description: 'User information retrieved successfully', type: UserResponseDto })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    async me(@Req() req: Request, @Res() res: Response) {
        try {

            const token = req.cookies.token;

            if (!token) {
                return res.status(401).json({ code: 401, message: 'Unauthorized' });
            }

            const decoded = await this.authService.verifyToken(token);
            if (!decoded) {
                return res.status(401).json({ code: 401, message: 'Unauthorized' });
            }
            const user = await this.userService.findById(decoded.userId);

            return res.status(200).json({
                code: 200, data: user
            });


        } catch (err) {
            return res.status(500).json({ code: 500, message: 'Internal server error' });
        }
    }

}
