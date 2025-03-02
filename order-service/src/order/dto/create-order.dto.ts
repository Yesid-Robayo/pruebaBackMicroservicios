import { ApiProperty } from "@nestjs/swagger";
import { OrderStatus } from "@prisma/client";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

/**
 * Data Transfer Object for creating an order.
 */
export class CreateOrderDTO {
    @ApiProperty({
        description: 'total amount of the order',
        example: 100
    })
    @IsNumber()
    @IsNotEmpty()
    total: number
    @ApiProperty({
        description: 'status of the order',
        example: OrderStatus.PROCESSING,
        examples: [OrderStatus.PENDING, OrderStatus.COMPLETED, OrderStatus.PROCESSING]
    })
    @IsString()
    @IsNotEmpty()
    status: OrderStatus

    @ApiProperty({
        description: 'user id of the order',
        example: 1
    })
    @IsNumber()
    @IsNotEmpty()
    userId: number

    @ApiProperty({
        description: 'description of the order',
        example: 'order description'
    })
    @IsString()
    description: string
}