import { IsNumber } from 'class-validator';

export class CheckoutDTO {
  @IsNumber()
  productId: number;
}
