import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { CreateOrderDTO } from './dto/create-order.dto';
import { ResponseOrderDTO } from './dto/response-order.dto';
import { OrderStatus } from '@prisma/client';
import { Request, Response } from 'express';

describe('OrderController', () => {
    let controller: OrderController;
    let orderService: OrderService;

    beforeEach(async () => {
        /**
         * Creates a testing module for the OrderController with a mocked OrderService.
         * 
         * The testing module includes:
         * - `OrderController` as the controller to be tested.
         * - `OrderService` as a provider with mocked methods:
         *   - `createOrder`: A jest mock function for creating orders.
         *   - `getOrdersById`: A jest mock function for retrieving orders by ID.
         *   - `updateOrderStatus`: A jest mock function for updating the status of an order.
         * 
         * @returns {Promise<TestingModule>} A promise that resolves to the compiled testing module.
         */
        const module: TestingModule = await Test.createTestingModule({
            controllers: [OrderController],
            providers: [
                {
                    provide: OrderService,
                    useValue: {
                        createOrder: jest.fn(),
                        getOrdersById: jest.fn(),
                        updateOrderStatus: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<OrderController>(OrderController);
        orderService = module.get<OrderService>(OrderService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('createOrder', () => {
        it('should create an order and return 201 status', async () => {
            const createOrderDto: CreateOrderDTO = {
                total: 100,
                status: OrderStatus.PROCESSING,
                userId: 1,
                description: 'Test order',
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;

            jest.spyOn(orderService, 'createOrder').mockResolvedValue({
                id: 1,
                total: 100,
                status: OrderStatus.PROCESSING,
                userId: 1,
                description: 'Test order',
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            await controller.createOrder(createOrderDto, res);

            expect(orderService.createOrder).toHaveBeenCalledWith(createOrderDto);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ code: 201, message: 'Order created successfully' });
        });

        it('should return 500 status if an error occurs', async () => {
            const createOrderDto: CreateOrderDTO = {
                total: 100,
                status: OrderStatus.PROCESSING,
                userId: 1,
                description: 'Test order',
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;

            jest.spyOn(orderService, 'createOrder').mockRejectedValue(new Error());

            await controller.createOrder(createOrderDto, res);

            expect(orderService.createOrder).toHaveBeenCalledWith(createOrderDto);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ code: 500, message: 'Internal server error' });
        });
    });

    describe('getOrdersById', () => {
        it('should fetch orders by user id and return 200 status', async () => {
            const userId = '1';
            const orders: ResponseOrderDTO[] = [
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
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;

            jest.spyOn(orderService, 'getOrdersById').mockResolvedValue(orders);

            await controller.getOrdersById(userId, res);

            expect(orderService.getOrdersById).toHaveBeenCalledWith(userId);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ code: 200, message: 'Orders fetched successfully', data: orders });
        });

        it('should return 500 status if an error occurs', async () => {
            const userId = '1';
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;

            jest.spyOn(orderService, 'getOrdersById').mockRejectedValue(new Error());

            await controller.getOrdersById(userId, res);

            expect(orderService.getOrdersById).toHaveBeenCalledWith(userId);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ code: 500, message: 'Internal server error' });
        });
    });

    describe('updateOrderStatus', () => {
        it('should update order status and return 200 status', async () => {
            const orderId = '1';
            const status = OrderStatus.COMPLETED;
            const token = 'valid-token';
            const req = {
                cookies: { token },
            } as unknown as Request;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;

            jest.spyOn(orderService, 'updateOrderStatus').mockResolvedValue({
                id: 1,
                total: 100,
                status: OrderStatus.COMPLETED,
                userId: 1,
                description: 'Test order',
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            await controller.updateOrderStatus(orderId, { status }, res, req);

            expect(orderService.updateOrderStatus).toHaveBeenCalledWith(orderId, status, token);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ code: 200, message: 'Order status updated successfully' });
        });

        it('should return 400 status if status is missing', async () => {
            const orderId = '1';
            const req = {
                cookies: { token: 'valid-token' },
            } as unknown as Request;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;

            await controller.updateOrderStatus(orderId, {} as { status: OrderStatus }, res, req);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ code: 400, message: 'Status is required' });
        });

        it('should return 401 status if user is not admin', async () => {
            const orderId = '1';
            const status = OrderStatus.COMPLETED;
            const token = 'invalid-token';
            const req = {
                cookies: { token },
            } as unknown as Request;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;

            jest.spyOn(orderService, 'updateOrderStatus').mockRejectedValue(new Error('User is not admin'));

            await controller.updateOrderStatus(orderId, { status }, res, req);

            expect(orderService.updateOrderStatus).toHaveBeenCalledWith(orderId, status, token);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ code: 401, message: 'User is not admin' });
        });

        it('should return 400 status if order status is invalid', async () => {
            const orderId = '1';
            const status = 'INVALID_STATUS' as OrderStatus;
            const token = 'valid-token';
            const req = {
                cookies: { token },
            } as unknown as Request;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;

            jest.spyOn(orderService, 'updateOrderStatus').mockRejectedValue(new Error('Invalid order status'));

            await controller.updateOrderStatus(orderId, { status }, res, req);

            expect(orderService.updateOrderStatus).toHaveBeenCalledWith(orderId, status, token);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ code: 400, message: 'Invalid order status' });
        });

        it('should return 500 status if an error occurs', async () => {
            const orderId = '1';
            const status = OrderStatus.COMPLETED;
            const token = 'valid-token';
            const req = {
                cookies: { token },
            } as unknown as Request;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;

            jest.spyOn(orderService, 'updateOrderStatus').mockRejectedValue(new Error());

            await controller.updateOrderStatus(orderId, { status }, res, req);

            expect(orderService.updateOrderStatus).toHaveBeenCalledWith(orderId, status, token);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ code: 500, message: 'Internal server error' });
        });
    });
});