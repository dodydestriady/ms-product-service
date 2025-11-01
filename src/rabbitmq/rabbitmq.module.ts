import { Module } from '@nestjs/common';
import { rabbitmqProvider } from './rabbitmq';

@Module({
    providers: [rabbitmqProvider],
    exports: [rabbitmqProvider]
})
export class RabbitMQModule {}
