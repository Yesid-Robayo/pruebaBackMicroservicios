import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDTO } from './dto/create-order.dto';
import { Request } from 'express';
import { OrderStatus } from '@prisma/client';
import { KafkaService } from 'src/kafka/kafka.service';

/**
 * Service responsible for handling order-related operations.
 */
@Injectable()
export class OrderService {

    /**
     * Constructs an instance of OrderService.
     * @param prismaService - The Prisma service for database operations.
     * @param kafkaService - The Kafka service for messaging.
     */
    constructor(private readonly prismaService: PrismaService,
                private readonly kafkaService: KafkaService) { }

    /**
     * Creates a new order.
     * @param data - The data for creating the order.
     * @returns The created order.
     */
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

    /**
     * Retrieves orders by user ID.
     * @param id - The ID of the user.
     * @returns A list of orders for the specified user.
     */
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

    /**
     * Updates the status of an order.
     * @param orderId - The ID of the order to update.
     * @param status - The new status of the order.
     * @param token - The token to check if the user is an admin.
     * @returns The updated order.
     * @throws Error if the user is not an admin or if the status is invalid.
     */
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
