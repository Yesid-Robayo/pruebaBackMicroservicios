import { ApiProperty } from "@nestjs/swagger";

export class ResponseDTO {
    @ApiProperty({
        description: 'Message of the response',
        example: 'User created successfully'
    })
    message: string;

    @ApiProperty({
        description: 'code of the response',
        example: 201
    })

    code: number;
}