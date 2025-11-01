import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import Redis from 'ioredis';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @Inject('REDIS_CLIENT')
    private readonly redisClient: Redis,
    @Inject('RABBITMQ_CLIENT')
    private readonly clientProxy: ClientProxy,
  ) {}

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    const newProduct = this.productRepository.create(createProductDto);
    const savedProduct = await this.productRepository.save(newProduct);

    this.clientProxy.emit('product.created', savedProduct);
    console.log(
      `Event 'product.created' emiited for product ID: ${savedProduct.id}`,
    );

    return savedProduct;
  }

  async getProductById(id: string): Promise<Product | null> {
    const productKey = `product:${id}`;
    const cachedProduct = await this.redisClient.get(productKey);

    if (cachedProduct) {
      console.log(`Cache HIT fot product ${id}`);

      return JSON.parse(cachedProduct);
    }

    console.log(`No Cache for product ${id}`);
    const product = await this.productRepository.findOneBy({ id });

    if (product) {
      await this.redisClient.setex(productKey, 600, JSON.stringify(product));
    }

    return product;
  }

  async decreaseStock(productId: string, quantity: number): Promise<void> {
    const product = await this.productRepository.findOneBy({ id: productId });

    if (!product) {
      console.error(`Product with ID ${productId} not found!`);
      throw new Error(`Product with ID ${productId} not found!`);
    }

    if (product.qty < quantity) {
      console.error(`Insufficient stock for product ${productId}.`);
      throw new Error(`Insufficient stock for product ${productId}.`);
    }

    product.qty -= quantity;
    await this.productRepository.save(product);

    await this.redisClient.del(`product:${productId}`);
    console.log(
      `Stock updated for product ${productId}. New stock: ${product.qty}`,
    );
  }
}
