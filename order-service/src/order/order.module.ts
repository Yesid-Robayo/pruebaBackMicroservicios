import { forwardRef, Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { KafkaService } from 'src/kafka/kafka.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [forwardRef(() => PrismaModule)],
  providers: [OrderService, KafkaService],
  controllers: [OrderController]
})
export class OrderModule { }
