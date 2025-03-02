import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from '../user/dto/create.user.dto';
import * as argon2 from 'argon2';
import { ResponseDTO } from 'src/utils/dto/response.dto';
import { UserResponseDto } from '../user/dto/user.response.dto';
import { Role } from '@prisma/client';

@Injectable()
export class UserService {
    constructor(private readonly prismaService: PrismaService) { }

    /**
     * Creates a new user in the system.
     * @param createUser - The DTO containing user details.
     * @returns A response indicating success or failure.
     * @throws Error if the role is invalid or the email already exists.
     */
    async createUser(createUser: CreateUserDto): Promise<ResponseDTO> {
        const { email, password, name, role } = createUser;
        if (!Object.values(Role).includes(role)) {
            throw new Error('Invalid role');
        }
        const existUser = await this.prismaService.user.findUnique({
            where: { email }
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

    /**
     * Validates a user by email and password.
     * @param email - The user's email.
     * @param password - The user's password.
     * @returns The user details if authentication is successful.
     * @throws Error if the user is not found or the password is incorrect.
     */
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
            updatedAt: user.updatedAt,
            createdAt: user.createdAt
        };
    }

    /**
     * Finds a user by their email address.
     * @param email - The user's email.
     * @returns The user details if found.
     * @throws Error if the user is not found.
     */
    async findByEmail(email: string): Promise<UserResponseDto | null> {
        const user = await this.prismaService.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new Error('User not found');
        }
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role as Role,
            updatedAt: user.updatedAt,
            createdAt: user.createdAt
        };
    }

    /**
     * Finds a user by their ID.
     * @param id - The user's ID.
     * @returns The user details if found.
     * @throws Error if the user is not found.
     */
    async findById(id: number): Promise<UserResponseDto | null> {
        const user = await this.prismaService.user.findUnique({
            where: { id },
        });
        if (!user) {
            throw new Error('User not found');
        }
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role as Role,
            updatedAt: user.updatedAt,
            createdAt: user.createdAt
        };
    }

    /**
     * Checks if a user has the "USER" role.
     * @param id - The user's ID.
     * @returns True if the user has the "USER" role, false otherwise.
     * @throws Error if the user is not found.
     */
    async comproveRoleIdUser(id: number): Promise<boolean> {
        const user = await this.prismaService.user.findUnique({
            where: { id },
        });
        if (!user) {
            throw new Error('User not found');
        }
        return user.role === Role.USER;
    }
}
