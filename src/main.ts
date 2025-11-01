import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import * as dotenv from "dotenv";

dotenv.config()
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const RABBITMQ_URL = configService.get<string>('RABBITMQ_URL');

  if (!RABBITMQ_URL) {
    throw new Error('RABBITMQ_URL is not defined');
  }

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [RABBITMQ_URL],
      queue: 'product_queue',
      queueOptions: {
        durable: false,
      },
    }, 
  });

  await app.startAllMicroservices();

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`Product Service is runing on HTTP ${port}`);
  console.log('Product Service is listening to RabbitMQ');
}
bootstrap();
