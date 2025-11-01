import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';

export const rabbitmqProvider: Provider = {
  provide: 'RABBITMQ_CLIENT',
  useFactory: (configService: ConfigService): ClientProxy => {
    return ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [configService.get<string>('RABBITMQ_URL') ?? ''],
        queue: 'product_queue',
        queueOptions: {
          durable: false,
        },
      },
    });
  },
  inject: [ConfigService],
};
