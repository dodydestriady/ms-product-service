import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './entities/product.entity';
import { EventPattern, Payload } from '@nestjs/microservices';
import { plainToInstance } from 'class-transformer';
import { ProductResponseDto } from './dto/product-response.dto';
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productsService.createProduct(createProductDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Product> {
    const product = await this.productsService.getProductById(id);

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return plainToInstance(ProductResponseDto, product, { excludeExtraneousValues: false });
  }

  @EventPattern('order.created')
  async handleOrderCreated(
    @Payload()
    data: {
      productId: string;
      quantity: number;
    },
  ) {
    console.log(
      `Received 'order.created' event for product ${data.productId}, quantity: ${data.quantity}`,
    );

    try {
      await this.productsService.decreaseStock(data.productId, data.quantity);
    } catch (error) {
      console.error(
        `Failed to process order for product ${data.productId}:`,
        error.message,
      );
    }
  }
}
