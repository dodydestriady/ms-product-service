import { Product } from './product.entity';

describe('Product Entity (Unit Test)', () => {
  it('should create a product instance with valid fields', () => {
    const now = new Date();

    const product = new Product();
    product.id = 'uuid-123';
    product.name = 'Keyboard';
    product.price = 499000.99;
    product.qty = 20;
    product.createdAt = now;

    expect(product.id).toBe('uuid-123');
    expect(product.name).toBe('Keyboard');
    expect(product.price).toBeCloseTo(499000.99);
    expect(product.qty).toBe(20);
    expect(product.createdAt).toBe(now);
  });

  it('should allow updating qty and price', () => {
    const product = new Product();
    product.name = 'Mouse';
    product.price = 200000;
    product.qty = 5;

    product.qty += 3;
    product.price = 180000;

    expect(product.qty).toBe(8);
    expect(product.price).toBe(180000);
  });
});