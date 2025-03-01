import { ApiProperty } from "@nestjs/swagger";
import { Role } from "src/utils/enum/enum";

export class UserResponseDto {
    @ApiProperty({
        description: 'User id',
        example: 1
    })
    id: number;

    @ApiProperty({
        description: 'User email',
        example: 'email',
    })

    email: string;

    @ApiProperty({
        description: 'User name',
        example: 'name',
    })

    name: string;

    @ApiProperty({
        description: 'Role  of the user',
        example: 'USER or ADMIN',
    })

    role: Role;




    @ApiProperty({
        description: 'User created at',
        example: '2021-07-21T21:00:00.000Z',

    })
    createdAt: Date;

    constructor(partial: Partial<UserResponseDto>) {
        Object.assign(this, partial);
    }
}