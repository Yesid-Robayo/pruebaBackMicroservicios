import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create.user.dto';
import * as argon2 from 'argon2';
import { ResponseDTO } from 'src/utils/response.dto';
import { UserResponseDto } from './dto/user.response.dto';
import { Role } from 'src/utils/enum/enum';
@Injectable()
export class UserService {
    constructor(private readonly prismaService: PrismaService) { }

    async createUser(createUser: CreateUserDto): Promise<ResponseDTO> {
        const { email, password, name, role } = createUser;
        if (!Object.values(Role).includes(role)) {
            throw new Error('Invalid role. Only USER and ADMIN are allowed.');
        }
        const existUser = await this.prismaService.user.findUnique({
            where: {
                email
            }
        });


        if (existUser) {
            throw new Error('Email already exists');
        }

        const hashPassword = await argon2.hash(password);

        await this.prismaService.user.create({
            data: {
                email,
                password: hashPassword,
                name,
                role
            }
        });

        return {
            message: 'User created successfully',
            code: 201
        };






    }
    async validateUser(email: string, password: string): Promise<UserResponseDto | null> {
        const user = await this.prismaService.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new Error('User not found');
        }

        const validPassword = await argon2.verify(user.password, password);
        if (!validPassword) {
            throw new Error('Invalid password');
        }

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role as Role,
            createdAt: user.createdAt
        };
    }
    async findByEmail(email: string): Promise<UserResponseDto | null> {
        const user = await this.prismaService.user.findUnique({
            where: { email },
        })
        if (!user) {
            throw new Error('User not found');
        }
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role as Role,
            createdAt: user.createdAt
        }
    }

    async findById(id: number): Promise<UserResponseDto | null> {
        const user = await this.prismaService.user.findUnique({
            where: { id },
        })
        if (!user) {
            throw new Error('User not found');
        }
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role as Role,
            createdAt: user.createdAt
        }
    }

    async comproveRoleIdUser(id: number): Promise<boolean> {
        const user = await this.prismaService.user.findUnique({
            where: { id },
        })
        if (!user) {
            throw new Error('User not found');
        }
        if (user.role === Role.USER) {
            return true;
        }
        return false;

    }
}
