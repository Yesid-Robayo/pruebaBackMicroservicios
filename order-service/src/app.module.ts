import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { KafkaService } from './kafka/kafka.service';
import { OrderModule } from './order/order.module';
import { OrderService } from './order/order.service';
import { TokenValidationMiddleware } from './token-validation/token-validation.middleware';
import * as path from 'path';


@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true, envFilePath: path.resolve(
      process.cwd(),
      `.env.${process.env.NODE_ENV || 'development'}`,
    ),
  }),
    PrismaModule, OrderModule],
  providers: [PrismaService, KafkaService, OrderService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TokenValidationMiddleware)
      .forRoutes(
        '*'
      )
  }
}
