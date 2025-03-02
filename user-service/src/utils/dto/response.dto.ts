import { ApiProperty } from "@nestjs/swagger";

/**
 * ResponseDTO is a data transfer object (DTO) that defines the shape of the data
 * that should be returned when creating a user.
 */
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