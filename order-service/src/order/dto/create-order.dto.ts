import { ApiProperty } from "@nestjs/swagger";
import { OrderStatus } from "@prisma/client";

export class CreateOrderDTO {
    @ApiProperty({
        description: 'total amount of the order',
        example: 100
    })
    total: number
    @ApiProperty({
        description: 'status of the order',
        examples: [OrderStatus.PENDING, OrderStatus.COMPLETED, OrderStatus.PROCESSING]
    })
    status: OrderStatus

    @ApiProperty({
        description: 'user id of the order',
        example: 1
    })
    userId: number

    @ApiProperty({
        description: 'description of the order',
        example: 'order description'
    })
    description: string
}