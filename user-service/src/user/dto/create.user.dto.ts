import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";
import { Role } from "src/utils/enum/enum";


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
        example: 'USER or ADMIN'
    })
    @IsNotEmpty()
    role: Role;


}