import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

/**
 * Data transfer object for the login endpoint.
 */
export class LoginDto {
    @ApiProperty({
        description: 'Email for the user',
        example: 'yesid.robayo@example.com'
    })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'Password for the user',
        example: 'yesid123'
    })
    @IsNotEmpty()
    @IsString()
    password: string;
}