import { forwardRef, Module } from '@nestjs/common';
import { UserService } from '../user-validation/user.service';
import { UserController } from './user.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [PrismaModule, forwardRef(() => AuthModule)],
  exports: [UserService],
  providers: [UserService],
  controllers: [UserController]
})
export class UserModule { }
