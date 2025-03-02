import { Body, Controller, Get, Param, Patch, Post, Req, Res } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDTO } from './dto/create-order.dto';
import { Request, Response } from 'express';
import { ResponseOrderDTO } from './dto/response-order.dto';
import { OrderStatus } from '@prisma/client';

/**
 * OrderController handles the order-related operations.
 */
@ApiTags('Order')
@Controller('order')
export class OrderController {

    /**
     * Constructor for OrderController.
     * @param orderService - The service to handle order operations.
     */
    constructor(private readonly orderService: OrderService) { }

    /**
     * Creates a new order.
     * @param createOrderDto - The data transfer object containing order details.
     * @param res - The response object.
     * @returns A JSON response indicating the result of the operation.
     */
    @Post('createOrder')
    @ApiOperation({ summary: 'Create order' })
    @ApiResponse({ status: 201, description: 'Order created successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    async createOrder(@Body() createOrderDto: CreateOrderDTO, @Res() res: Response) {
        try {
            await this.orderService.createOrder(createOrderDto);
            return res.status(201).json({ code: 201, message: 'Order created successfully' });
        } catch (err) {
            return res.status(500).json({ code: 500, message: 'Internal server error' });
        }
    }

    /**
     * Retrieves orders by user ID.
     * @param id - The user ID to fetch orders for.
     * @param res - The response object.
     * @returns A JSON response with the fetched orders.
     */
    @Get('getOrdersById/:id')
    @ApiOperation({ summary: 'Get orders by user id' })
    @ApiParam({ name: 'id', type: String, description: 'User ID to fetch orders', example: '1' })
    @ApiResponse({ status: 200, description: 'Orders fetched successfully', type: ResponseOrderDTO })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    async getOrdersById(@Param('id') id: string, @Res() res: Response) {
        try {
            const orders = await this.orderService.getOrdersById(id);
            return res.status(200).json({ code: 200, message: 'Orders fetched successfully', data: orders });
        } catch (err) {
            return res.status(500).json({ code: 500, message: 'Internal server error' });
        }
    }

    /**
     * Updates the status of an order.
     * @param id - The order ID.
     * @param body - The request body containing the new status.
     * @param res - The response object.
     * @param req - The request object.
     * @returns A JSON response indicating the result of the operation.
     */
    @Patch('updateOrderStatus/:id')
    @ApiOperation({ summary: 'Update order status - requires admin login' })
    @ApiParam({ name: 'id', type: String, description: 'Order ID', example: '1' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                status: {
                    type: 'string',
                    enum: Object.values(OrderStatus),
                    example: OrderStatus.COMPLETED,
                },
            },
            required: ['status'],
            example: {
                status: OrderStatus.COMPLETED,
            },
        },
    })

    /**
     * Updates the status of an order.
     * @param id - The order ID.
     * @param body - The request body containing the new status.
     * @param res - The response object.    
     * @param req - The request object.
     * @returns A JSON response indicating the result of the operation.
     */

    @ApiResponse({ status: 200, description: 'Order status updated successfully' })
    @ApiResponse({ status: 400, description: 'Bad request - Missing or invalid data' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    async updateOrderStatus(
        @Param('id') id: string,
        @Body() body: { status: OrderStatus },
        @Res() res: Response,
        @Req() req: Request
    ) {
        try {
            if (!body.status) {
                return res.status(400).json({ code: 400, message: 'Status is required' });
            }
            const token = req.cookies.token;

            await this.orderService.updateOrderStatus(id, body.status, token);
            return res.status(200).json({ code: 200, message: 'Order status updated successfully' });
        } catch (err) {
            if (err.message === 'User is not admin') {
                return res.status(401).json({ code: 401, message: 'User is not admin' });
            }
            if (err.message === 'Invalid order status') {
                return res.status(400).json({ code: 400, message: 'Invalid order status' });
            }
            return res.status(500).json({ code: 500, message: 'Internal server error' });
        }
    }

}