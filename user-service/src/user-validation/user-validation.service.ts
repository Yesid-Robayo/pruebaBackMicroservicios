import { Injectable, OnModuleInit } from '@nestjs/common';
import { UserService } from 'src/user-validation/user.service';
import { AuthService } from 'src/auth/auth.service';
import { KafkaService } from 'src/kafka/kafka.service';

@Injectable()
export class UserValidationService implements OnModuleInit {
  constructor(
    private readonly kafkaService: KafkaService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) { }

  /**
   * Initializes Kafka consumers for user validation upon module startup.
   * Listens for requests to check if a user exists and whether a user is an admin.
   */
  async onModuleInit() {
    await this.kafkaService.createConsumer(
      'check_user_exists',
      'user-validation-group-exists',
      async (payload) => {
        const { token } = payload;
        const userExists = await this.findUserByToken(token);
        return { token, userExists: (userExists !== null) };
      },
      { topic: 'token_validation_response' }
    );

    await this.kafkaService.createConsumer(
      'check_user_is_admin',
      'user-validation-group-admin',
      async (payload) => {
        const { token } = payload;
        const isuser = await this.findUserByToken(token);
        return { isAdmin: !isuser };
      },
      { topic: 'check_user_is_admin_response' }
    );
  }

  /**
   * Finds a user based on the provided authentication token.
   * @param token - The authentication token of the user.
   * @returns The user data if found; otherwise, null.
   */
  private async findUserByToken(token: string) {
    try {
      const payload = this.authService.verifyToken(token);
      if (!payload) {
        return null;
      }
      return await this.userService.comproveRoleIdUser(payload.userId);
    } catch (error) {
      return null;
    }
  }
}
