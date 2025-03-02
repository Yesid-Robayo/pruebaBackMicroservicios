import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDTO } from './dto/create-order.dto';
import { Prisma } from '@prisma/client';
import { Request } from 'express';

describe('OrderService', () => {
  let service: OrderService;
  let prismaService: PrismaService;

  const mockOrderData: CreateOrderDTO = {
    total: 100,
    status: 'PENDING', // Ejemplo de estado
    userId: 1,
    description: 'Test order'
  };

  const mockPrismaService = {
    order: {
      create: jest.fn().mockResolvedValue(mockOrderData),
      findMany: jest.fn().mockResolvedValue([mockOrderData]),
      update: jest.fn().mockResolvedValue(mockOrderData),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrder', () => {
    it('should create an order', async () => {
      const result = await service.createOrder(mockOrderData);
      expect(result).toEqual(mockOrderData);
      expect(prismaService.order.create).toHaveBeenCalledWith({
        data: mockOrderData,
      });
    });
  });

  describe('getOrdersById', () => {
    it('should return an array of orders for the user', async () => {
      const req = { params: { id: '1' } } as unknown as Request;
      const result = await service.getOrdersById(req);
      expect(result).toEqual([mockOrderData]);
      expect(prismaService.order.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('updateOrderStatus', () => {
    it('should update the order status', async () => {
      const result = await service.updateOrderStatus(1, 'COMPLETED');
      expect(result).toEqual(mockOrderData);
      expect(prismaService.order.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'COMPLETED' },
      });
    });
  });
});
