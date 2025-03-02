import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
/**
 * Initializes and starts the NestJS application.
 * 
 * - Enables CORS for cross-origin requests.
 * - Sets up global validation pipes with whitelisting and transformation.
 * - Uses cookie parser middleware.
 * - Configures Swagger for API documentation with a title, description, version, and tag.
 * - Starts the application on the specified port (default is 3000).
 * - Logs the URL where the application is running.
 * 
 * @async
 * @function bootstrap
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
    .setTitle('Order Service')
    .setDescription('The order service API description - requires authentication to access all endpoints')
    .setVersion('1.0')
    .addTag('Order')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);


  await app.listen(process.env.PORT ?? 3000);

  console.log(`Application is running on: ${await app.getUrl()}`);

}
bootstrap();
