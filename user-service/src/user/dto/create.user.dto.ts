import { ApiProperty } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { IsEmail, IsNotEmpty } from "class-validator";

/**
 * CreateUserDto is a data transfer object (DTO) that defines the shape of the data
 * that should be provided when creating a new user.
 */
export class CreateUserDto {
    @ApiProperty({
        description: 'The email of the user',
        example: 'yesid.robayo@example.com'
    })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'The password of the user',
        example: 'yesid123'
    })
    @IsNotEmpty()
    password: string;

    @ApiProperty({
        description: 'The name of the user',
        example: 'Yesid Robayo'
    })
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        description: 'The  role of the user',
        examples: ['USER', 'ADMIN'],
        example: 'USER'
    })
    @IsNotEmpty()
    role: Role;


}