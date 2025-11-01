import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { RedisModule } from 'src/redis/redis.module';
import { RabbitMQModule } from 'src/rabbitmq/rabbitmq.module';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), RedisModule, RabbitMQModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
