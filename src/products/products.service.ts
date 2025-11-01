import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import Redis from 'ioredis';
import { setUncaughtExceptionCaptureCallback } from 'process';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @Inject('REDIS_CLIENT')
    private readonly redisClient: Redis,
  ) {}

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    const newProduct = this.productRepository.create(createProductDto);
    return this.productRepository.save(newProduct);
  }

  async getProductById(id: string): Promise<Product | null> {
    const productKey = `product:${id}`
    const cachedProduct = await this.redisClient.get(productKey);

    if (cachedProduct) {
        console.log(`Cache HIT fot product ${id}`)

        return JSON.parse(cachedProduct)
    }

    console.log(`No Cache for product ${id}`)
    const product = await this.productRepository.findOneBy({ id })

    if (product) {
        await this.redisClient.setex(productKey, 600, JSON.stringify(product));
    }

    return product;
  }
}
