import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { KafkaService } from 'src/kafka/kafka.service';
import { CreateOrderDTO } from './dto/create-order.dto';
import { OrderStatus } from '@prisma/client';

describe('OrderService', () => {
    let service: OrderService;
    let prismaService: PrismaService;
    let kafkaService: KafkaService;

    beforeEach(async () => {
        /**
         * Creates a testing module for the OrderService with mocked dependencies.
         * 
         * The module includes the following providers:
         * - `OrderService`: The service being tested.
         * - `PrismaService`: Mocked Prisma service with `create`, `findMany`, and `update` methods.
         * - `KafkaService`: Mocked Kafka service with a `sendAndReceive` method.
         * 
         * @returns {Promise<TestingModule>} A promise that resolves to the compiled testing module.
         */
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OrderService,
                {
                    provide: PrismaService,
                    useValue: {
                        order: {
                            create: jest.fn(),
                            findMany: jest.fn(),
                            update: jest.fn(),
                        },
                    },
                },
                {
                    provide: KafkaService,
                    useValue: {
                        sendAndReceive: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<OrderService>(OrderService);
        prismaService = module.get<PrismaService>(PrismaService);
        kafkaService = module.get<KafkaService>(KafkaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createOrder', () => {
        it('should create an order', async () => {
            const createOrderDto: CreateOrderDTO = {
                total: 100,
                status: OrderStatus.PROCESSING,
                userId: 1,
                description: 'Test order',
            };
            const expectedResult = {
                id: 1,
                ...createOrderDto,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            jest.spyOn(prismaService.order, 'create').mockResolvedValue(expectedResult);

            const result = await service.createOrder(createOrderDto);

            expect(prismaService.order.create).toHaveBeenCalledWith({
                data: {
                    total: createOrderDto.total,
                    status: createOrderDto.status,
                    userId: createOrderDto.userId,
                    description: createOrderDto.description,
                },
            });
            expect(result).toEqual(expectedResult);
        });
    });

    describe('getOrdersById', () => {
        it('should fetch orders by user id', async () => {
            const userId = '1';
            const expectedOrders = [
                {
                    id: 1,
                    total: 100,
                    status: OrderStatus.PROCESSING,
                    userId: 1,
                    description: 'Test order',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];

            jest.spyOn(prismaService.order, 'findMany').mockResolvedValue(expectedOrders);

            const result = await service.getOrdersById(userId);

            expect(prismaService.order.findMany).toHaveBeenCalledWith({
                where: {
                    userId: Number(userId),
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
            expect(result).toEqual(expectedOrders);
        });
    });

    describe('updateOrderStatus', () => {
        it('should update order status if user is admin and status is valid', async () => {
            const orderId = '1';
            const status = OrderStatus.COMPLETED;
            const token = 'valid-token';
            const kafkaResponse = { isAdmin: true };

            jest.spyOn(kafkaService, 'sendAndReceive').mockResolvedValue(kafkaResponse);
            jest.spyOn(prismaService.order, 'update').mockResolvedValue({
                id: 1,
                status,
                total: 100,
                userId: 1,
                description: 'Test order',
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const result = await service.updateOrderStatus(orderId, status, token);

            expect(kafkaService.sendAndReceive).toHaveBeenCalledWith(
                'check_user_is_admin',
                { token },
                'check_user_is_admin_response',
                5000,
            );
            expect(prismaService.order.update).toHaveBeenCalledWith({
                where: {
                    id: Number(orderId),
                },
                data: {
                    status,
                },
            });
            expect(result.status).toBe(status);
        });

        it('should throw an error if user is not admin', async () => {
            const orderId = '1';
            const status = OrderStatus.COMPLETED;
            const token = 'invalid-token';
            const kafkaResponse = { isAdmin: false };

            jest.spyOn(kafkaService, 'sendAndReceive').mockResolvedValue(kafkaResponse);

            await expect(service.updateOrderStatus(orderId, status, token)).rejects.toThrow('User is not admin');
        });

        it('should throw an error if order status is invalid', async () => {
            const orderId = '1';
            const status = 'INVALID_STATUS' as OrderStatus;
            const token = 'valid-token';
            const kafkaResponse = { isAdmin: true };

            jest.spyOn(kafkaService, 'sendAndReceive').mockResolvedValue(kafkaResponse);

            await expect(service.updateOrderStatus(orderId, status, token)).rejects.toThrow('Invalid order status');
        });

        it('should throw an error if Kafka service fails', async () => {
            const orderId = '1';
            const status = OrderStatus.COMPLETED;
            const token = 'valid-token';

            jest.spyOn(kafkaService, 'sendAndReceive').mockRejectedValue(new Error('Kafka error'));

            await expect(service.updateOrderStatus(orderId, status, token)).rejects.toThrow('Kafka error');
        });
    });
});