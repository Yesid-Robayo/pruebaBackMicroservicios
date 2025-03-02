import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDTO } from './dto/create-order.dto';
import { Request } from 'express';
import { OrderStatus } from '@prisma/client';
import { KafkaService } from 'src/kafka/kafka.service';

@Injectable()
export class OrderService {

    constructor(private readonly prismaService: PrismaService,
        private readonly kafkaService: KafkaService
    ) { }

    async createOrder(data: CreateOrderDTO) {
        return this.prismaService.order.create({
            data: {
                total: data.total,
                status: data.status,
                userId: data.userId,
                description: data.description
            }
        });
    }

    async getOrdersById(id: string) {
        return this.prismaService.order.findMany({
            where: {
                userId: Number(id)
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    async updateOrderStatus(orderId: string, status: OrderStatus, token: string) {
        const response = await this.kafkaService.sendAndReceive('check_user_is_admin', { token }, 'check_user_is_admin_response', 5000);
        if (!response || !response.isAdmin) {
            throw new Error('User is not admin');
        }
        if (!Object.values(OrderStatus).includes(status)) {
            throw new Error('Invalid order status');
        }
        return this.prismaService.order.update({
            where: {
                id: Number(orderId)
            },
            data: {
                status
            }
        });
    }
}
