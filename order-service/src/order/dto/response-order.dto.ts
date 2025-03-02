import { ApiProperty } from "@nestjs/swagger";
import { OrderStatus } from "@prisma/client";

/**
 * Data Transfer Object for the response of an order.
 */
export class ResponseOrderDTO {
    @ApiProperty({
        example: 1,
        description: 'The id of the order',
    })
    id: number;
    @ApiProperty({
        example: 100,
        description: 'The total of the order',
    })
    total: number;
    @ApiProperty({
        example: 'CREATED',
        description: 'The status of the order',
    })
    status: OrderStatus;

    @ApiProperty({
        example: 1,
        description: 'The id of the user',
    })
    userId: number;
    @ApiProperty({
        example: 'This is a description',
        description: 'The description of the order',
    })
    description: string;
    @ApiProperty({
        example: '2021-09-22T14:43:00.000Z',
        description: 'The date the order was created',
    })
    createdAt: Date;

    @ApiProperty({
        example: '2021-09-22T14:43:00.000Z',
        description: 'The date the order was updated',
    })
    updatedAt: Date;
}