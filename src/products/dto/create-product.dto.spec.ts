import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateProductDto } from './create-product.dto';

describe('CreateProductDto', () => {
  it('should pass validation with valid data', async () => {
    const dto = plainToInstance(CreateProductDto, {
      name: 'Laptop',
      price: 15000000,
      qty: 10,
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail if name is not a string', async () => {
    const dto = plainToInstance(CreateProductDto, {
      name: 123,
      price: 15000000,
      qty: 10,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('name');
  });

  it('should fail if price is negative', async () => {
    const dto = plainToInstance(CreateProductDto, {
      name: 'Laptop',
      price: -1000,
      qty: 10,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('price');
  });

  it('should fail if qty is missing', async () => {
    const dto = plainToInstance(CreateProductDto, {
      name: 'Laptop',
      price: 15000000,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('qty');
  });
});