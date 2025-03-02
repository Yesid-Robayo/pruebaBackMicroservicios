import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { KafkaService } from './kafka/kafka.service';
import { OrderModule } from './order/order.module';
import { OrderService } from './order/order.service';
import { TokenValidationMiddleware } from './token-validation/token-validation.middleware';


@Module({
  imports: [ConfigModule.forRoot(
    { isGlobal: true }
  ), PrismaModule, OrderModule],
  providers: [PrismaService, KafkaService, OrderService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TokenValidationMiddleware)
      .forRoutes(
        { path: '/order/createOrder', method: RequestMethod.POST },
        { path: '/order/getOrdersById/:id', method: RequestMethod.GET },
      )
  }
}
