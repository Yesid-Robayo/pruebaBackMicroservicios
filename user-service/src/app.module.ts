import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { KafkaService } from './kafka/kafka.service';
import { UserValidationService } from './user-validation/user-validation.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UserModule,
    AuthModule
  ],
  providers: [KafkaService,
    PrismaModule,
    UserValidationService
  ],
})
export class AppModule { }
