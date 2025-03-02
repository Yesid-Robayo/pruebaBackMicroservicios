import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

/**
 * Initializes and starts the NestJS application.
 * 
 * - Creates the NestJS application using the AppModule.
 * - Enables Cross-Origin Resource Sharing (CORS).
 * - Sets up global validation pipes with whitelisting, forbidding non-whitelisted properties, and transformation.
 * - Uses cookie parser middleware.
 * - Configures Swagger for API documentation with title, description, version, and tags.
 * - Sets up Swagger module at the '/api' endpoint.
 * - Starts the application on the specified port or defaults to port 3000.
 * - Logs the URL where the application is running.
 * 
 * @returns {Promise<void>} A promise that resolves when the application has started.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors()

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle('User Service')
    .setDescription('The user service API description')
    .setVersion('1.0')
    .addTag('user')
    .build();


  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
 

  await app.listen(process.env.PORT ?? 3000);

  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
