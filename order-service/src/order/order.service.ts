import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDTO } from './dto/create-order.dto';
import { Request } from 'express';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrderService {

    constructor(private readonly prismaService: PrismaService
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

    async getOrdersById(req: Request) {
        return this.prismaService.order.findMany({
            where: {
                userId: Number(req.params.id)
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    async updateOrderStatus(orderId: number, status: OrderStatus) {
        return this.prismaService.order.update({
            where: {
                id: orderId
            },
            data: {
                status
            }
        });
    }
}
