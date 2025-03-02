import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { KafkaService } from './kafka/kafka.service';
import { UserValidationService } from './user-validation/user-validation.service';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, envFilePath: path.resolve(
        process.cwd(),
        `.env.${process.env.NODE_ENV || 'development'}`,
      ),
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
