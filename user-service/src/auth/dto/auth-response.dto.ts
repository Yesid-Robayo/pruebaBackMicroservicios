import { ApiProperty } from "@nestjs/swagger";
import { UserResponseDto } from "src/user/dto/user.response.dto";

export class AuthResponseDto {
    @ApiProperty({
        description: 'JWT token for the user',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJpYXQiOjE2MjYwNjI...'})
    token: string;

    @ApiProperty({
        description: 'Information about the user',
        type: UserResponseDto  
    })
    user: UserResponseDto;

    constructor(token: string, user: UserResponseDto) {
        this.token = token;
        this.user = user;
    }
}