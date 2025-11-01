import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Redis from 'ioredis';
import { ClientProxy } from '@nestjs/microservices';

type MockRepo = {
  create: jest.Mock;
  save: jest.Mock;
  findOneBy: jest.Mock;
};

const mockRepo: MockRepo = {
  create: jest.fn(),
  save: jest.fn(),
  findOneBy: jest.fn(),
};

const mockRedis = {
  get: jest.fn(),
  setex: jest.fn(),
  del: jest.fn(),
};

const mockClientProxy = {
  emit: jest.fn(),
};

describe('ProductsService (Unit)', () => {
  let service: ProductsService;
  let repo: Repository<Product>;
  let redisClient: Redis;
  let clientProxy: ClientProxy;

  beforeEach(async () => {
    mockRepo.create.mockReset();
    mockRepo.save.mockReset();
    mockRepo.findOneBy.mockReset();
    mockRedis.get.mockReset();
    mockRedis.setex.mockReset();
    mockRedis.del.mockReset();
    mockClientProxy.emit.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getRepositoryToken(Product), useValue: mockRepo },
        { provide: 'REDIS_CLIENT', useValue: mockRedis },
        { provide: 'RABBITMQ_CLIENT', useValue: mockClientProxy },
      ],
    }).compile();

    service = module.get(ProductsService);
    repo = module.get(getRepositoryToken(Product));
    redisClient = module.get('REDIS_CLIENT');
    clientProxy = module.get('RABBITMQ_CLIENT');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createProduct', () => {
    it('should create and emit product', async () => {
      const dto: CreateProductDto = { name: 'Laptop', price: 10000000, qty: 5 };
      const mockProduct = { id: 'abc123', ...dto };

      mockRepo.create.mockReturnValue(mockProduct);
      mockRepo.save.mockResolvedValue(mockProduct);

      const result = await service.createProduct(dto);

      expect(mockRepo.create).toHaveBeenCalledWith(dto);
      expect(mockRepo.save).toHaveBeenCalledWith(mockProduct);
      expect(mockClientProxy.emit).toHaveBeenCalledWith('product.created', mockProduct);
      expect(result).toEqual(mockProduct);
    });
  });

  describe('getProductById', () => {
    it('should return cached product if exists', async () => {
      const cached = JSON.stringify({ id: 'abc123', name: 'Mouse', price: 200000, qty: 10 });
      mockRedis.get.mockResolvedValue(cached);

      const result = await service.getProductById('abc123');

      expect(mockRedis.get).toHaveBeenCalledWith('product:abc123');
      expect(result).toEqual(JSON.parse(cached));
    });

    it('should fetch from DB and cache if not in Redis', async () => {
      mockRedis.get.mockResolvedValue(null);
      const product = { id: 'abc123', name: 'Mouse', price: 200000, qty: 10 };
      mockRepo.findOneBy.mockResolvedValue(product);

      const result = await service.getProductById('abc123');

      expect(mockRepo.findOneBy).toHaveBeenCalledWith({ id: 'abc123' });
      expect(mockRedis.setex).toHaveBeenCalledWith('product:abc123', 600, JSON.stringify(product));
      expect(result).toEqual(product);
    });
  });

  describe('decreaseStock', () => {
    it('should throw if product not found', async () => {
      mockRepo.findOneBy.mockResolvedValue(null);

      await expect(service.decreaseStock('abc123', 1)).rejects.toThrow('Product with ID abc123 not found!');
    });

    it('should throw if stock insufficient', async () => {
      mockRepo.findOneBy.mockResolvedValue({ id: 'abc123', qty: 2 });

      await expect(service.decreaseStock('abc123', 5)).rejects.toThrow('Insufficient stock for product abc123.');
    });

    it('should decrease stock and clear cache', async () => {
      const product = { id: 'abc123', qty: 10 };
      mockRepo.findOneBy.mockResolvedValue(product);
      mockRepo.save.mockResolvedValue({ ...product, qty: 7 });

      await service.decreaseStock('abc123', 3);

      expect(product.qty).toBe(7);
      expect(mockRepo.save).toHaveBeenCalledWith(product);
      expect(mockRedis.del).toHaveBeenCalledWith('product:abc123');
    });
  });
});