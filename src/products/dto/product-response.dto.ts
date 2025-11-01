import { Transform } from 'class-transformer';

export class ProductResponseDto {
  id: string;
  name: string;

  @Transform(({ value }) => parseFloat(value))
  price: number;

  qty: number;
  createdAt: Date;
}
