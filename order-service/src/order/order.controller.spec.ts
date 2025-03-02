import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { CreateOrderDTO } from './dto/create-order.dto';
import { Response } from 'express';
import { HttpStatus } from '@nestjs/common';

describe('OrderController', () => {
  let controller: OrderController;
  let orderService: OrderService;
  let response: Response;

  const mockCreateOrderDto: CreateOrderDTO = {
    total: 100,
    status: 'PENDING',
    userId: 1,
    description: 'Test order',
  };

  const mockOrderService = {
    createOrder: jest.fn().mockResolvedValue(undefined),  // Simulando el método createOrder
    getOrdersById: jest.fn().mockResolvedValue([mockCreateOrderDto]),  // Simulando obtener órdenes
    updateOrderStatus: jest.fn().mockResolvedValue(mockCreateOrderDto),  // Simulando actualización de estado
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: mockOrderService,
        },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    orderService = module.get<OrderService>(OrderService);
    response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown as Response;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createOrder', () => {
    it('should return status 201 and success message when order is created', async () => {
      await controller.createOrder(mockCreateOrderDto, response);
      expect(orderService.createOrder).toHaveBeenCalledWith(mockCreateOrderDto);
      expect(response.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(response.json).toHaveBeenCalledWith({
        code: 201,
        message: 'Order created successfully',
      });
    });

    it('should return status 500 and error message when an error occurs', async () => {
      jest.spyOn(orderService, 'createOrder').mockRejectedValueOnce(new Error('Internal server error'));
      await controller.createOrder(mockCreateOrderDto, response);
      expect(response.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(response.json).toHaveBeenCalledWith({
        code: 500,
        message: 'Internal server error',
      });
    });
  });

  describe('getOrdersById', () => {
    it('should return status 200 and orders when fetched successfully', async () => {
      const req = { params: { id: '1' } } as any;
      await controller.getOrdersById(req, response);
      expect(orderService.getOrdersById).toHaveBeenCalledWith(req);
      expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(response.json).toHaveBeenCalledWith({
        code: 200,
        message: 'Orders fetched successfully',
        data: [mockCreateOrderDto],
      });
    });

    it('should return status 500 and error message when an error occurs', async () => {
      jest.spyOn(orderService, 'getOrdersById').mockRejectedValueOnce(new Error('Internal server error'));
      const req = { params: { id: '1' } } as any;
      await controller.getOrdersById(req, response);
      expect(response.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(response.json).toHaveBeenCalledWith({
        code: 500,
        message: 'Internal server error',
      });
    });
  });

  describe('updateOrderStatus', () => {
    it('should return status 200 and success message when order status is updated', async () => {
      const body = { orderId: 1, status: 'COMPLETED' };
      await controller.updateOrderStatus(body, response);
      expect(orderService.updateOrderStatus).toHaveBeenCalledWith(body.orderId, body.status);
      expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(response.json).toHaveBeenCalledWith({
        code: 200,
        message: 'Order status updated successfully',
      });
    });

    it('should return status 500 and error message when an error occurs', async () => {
      jest.spyOn(orderService, 'updateOrderStatus').mockRejectedValueOnce(new Error('Internal server error'));
      const body = { orderId: 1, status: 'COMPLETED' };
      await controller.updateOrderStatus(body, response);
      expect(response.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(response.json).toHaveBeenCalledWith({
        code: 500,
        message: 'Internal server error',
      });
    });
  });
});
