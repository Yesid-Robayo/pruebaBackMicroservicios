import { Injectable, OnModuleInit } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { AuthService } from 'src/auth/auth.service';
import { KafkaService } from 'src/kafka/kafka.service';

@Injectable()
export class UserValidationService implements OnModuleInit {
  constructor(
    private readonly kafkaService: KafkaService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) { }

  async onModuleInit() {
    await this.kafkaService.createConsumer(
      'check_user_exists',
      'user-validation-group',
      async (payload) => {
        const { token } = payload;
        const userExists = await this.findUserByToken(token);
        return { token, userExists: !!userExists };
      },
      { topic: 'token_validation_response' } 
    );
  }

  private async findUserByToken(token: string) {
    try {
      const payload = this.authService.verifyToken(token);
      if (payload) {
        return await this.userService.comproveRoleIdUser(payload.userId);
      }
      return null;
    } catch (error) {
      return null;
    }
  }
}