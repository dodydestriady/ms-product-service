import { ClientProxyFactory, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const client = ClientProxyFactory.create({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://guest:guest@localhost:5672'], // ganti sesuai env
      queue: 'product_queue',
      queueOptions: { durable: false },
    },
  });

  const payload = {
    productId: '4bc15c3e-ce25-4a8d-987d-173b5f295353',
    quantity: 5,
  };

  console.log('Publishing order.created...');
  await client.emit('order.created', payload).toPromise();
  console.log('Published!');
}

bootstrap();
