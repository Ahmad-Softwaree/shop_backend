import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

export class CreateProductDto {
  @IsString({ message: 'validation.product.enName.isString' })
  @IsNotEmpty({ message: 'validation.product.enName.isNotEmpty' })
  @MaxLength(100, { message: 'validation.product.enName.maxLength' })
  enName: string;

  @IsString({ message: 'validation.product.arName.isString' })
  @IsNotEmpty({ message: 'validation.product.arName.isNotEmpty' })
  @MaxLength(100, { message: 'validation.product.arName.maxLength' })
  arName: string;

  @IsString({ message: 'validation.product.ckbName.isString' })
  @IsNotEmpty({ message: 'validation.product.ckbName.isNotEmpty' })
  @MaxLength(100, { message: 'validation.product.ckbName.maxLength' })
  ckbName: string;

  @IsString({ message: 'validation.product.enDesc.isString' })
  @IsNotEmpty({ message: 'validation.product.enDesc.isNotEmpty' })
  enDesc: string;

  @IsString({ message: 'validation.product.arDesc.isString' })
  @IsNotEmpty({ message: 'validation.product.arDesc.isNotEmpty' })
  arDesc: string;

  @IsString({ message: 'validation.product.ckbDesc.isString' })
  @IsNotEmpty({ message: 'validation.product.ckbDesc.isNotEmpty' })
  ckbDesc: string;

  @IsOptional()
  @IsString({ message: 'validation.product.image.isString' })
  image?: string;

  @IsNumber({}, { message: 'validation.product.price.isNumber' })
  @Type(() => Number)
  @Min(0, { message: 'validation.product.price.min' })
  price: number;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}
