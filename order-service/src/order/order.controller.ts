import { Body, Controller, Get, Patch, Post, Req, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDTO } from './dto/create-order.dto';
import { Request, Response } from 'express';
import { ResponseOrderDTO } from './dto/response-order.dto';

@ApiTags('Order')
@Controller('order')
export class OrderController {

    constructor(private readonly orderService: OrderService) { }

    @Post('createOrder')
    @ApiOperation({ summary: 'Create order' })
    @ApiResponse({ status: 201, description: 'Order created successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    async createOrder(@Body() createOrderDto: CreateOrderDTO, @Res() res: Response) {
        try {
            await this.orderService.createOrder(createOrderDto);
            return res.status(201).json({ code: 201, message: 'Order created successfully' });
        } catch (err) {
            return res.status(500).json({ code: 500, message: 'Internal server error' });
        }
    }


    @Get('getOrdersById/:id')
    @ApiOperation({ summary: 'Get orders by user id' })
    @ApiResponse({ status: 200, description: 'Orders fetched successfully', type: ResponseOrderDTO })
    @ApiResponse({ status: 400, description: 'Bad request' })
    async getOrdersById(@Req() req:
        Request, @Res() res: Response) {
        try {
            const orders = await this.orderService.getOrdersById(req);
            return res.status(200).json({ code: 200, message: 'Orders fetched successfully', data: orders });
        } catch (err) {
            return res.status(500).json({ code: 500, message: 'Internal server error' });
        }
    }

    @Patch('updateOrderStatus/:id')
    @ApiOperation({ summary: 'Update order status' })
    @ApiResponse({ status: 200, description: 'Order status updated successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    async updateOrderStatus(@Body() body: any, @Res() res: Response) {
        try {
            await this.orderService.updateOrderStatus(body.orderId, body.status);
            return res.status(200).json({ code: 200, message: 'Order status updated successfully'});
        } catch (err) {
            return res.status(500).json({ code: 500, message: 'Internal server error' });
        }
    }

}
