import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { Pagination, Queries } from 'lib/functions';
import {
  CRUDReturn,
  PaginationParams,
  PaginationType,
  QueryParam,
  RegularType,
} from 'src/types/global';
import { Product } from 'src/generated/prisma/client';
import { EmptyBodyInterceptor } from 'src/common/interceptors/check-empty-body.interceptor';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadInterceptor } from 'src/common/interceptors/file-upload.interceptor';
import { FileCleanupInterceptor } from 'src/common/interceptors/file-cleanup.interceptor';
import { UploadConfig } from 'src/decorators/upload-config.decorator';
import { getMulterOptions } from 'src/common/config/multer.config';
import { Request } from 'express';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('')
  async get(
    @Pagination() pagination: PaginationParams,
    @Queries() query: QueryParam,
  ): Promise<PaginationType<Partial<Product>>> {
    return await this.productService.get(pagination, query, false);
  }

  @Get('/user/:id')
  async getUserProducts(
    @Pagination() pagination: PaginationParams,
    @Queries() query: QueryParam,
  ): Promise<PaginationType<Partial<Product>>> {
    return await this.productService.get(pagination, query, true);
  }

  @Get('/:id')
  async getOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<RegularType<Partial<Product>>> {
    return await this.productService.getOne(id);
  }

  @Post('')
  @UploadConfig({
    bucket: 'products',
    fieldName: 'image',
    required: true,
    maxSize: 5 * 1024 * 1024,
    allowedTypes: /\.(jpg|jpeg|png|gif|webp)$/i,
  })
  @UseInterceptors(
    EmptyBodyInterceptor,
    FileInterceptor('image', getMulterOptions()),
    FileUploadInterceptor,
    FileCleanupInterceptor,
  )
  async create(
    @Body() body: CreateProductDto,
    @Req() req: Request,
  ): Promise<CRUDReturn> {
    return await this.productService.insert(body, req.fileData);
  }

  @Put('/:id')
  @UploadConfig({
    bucket: 'products',
    fieldName: 'image',
    required: false,
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: /\.(jpg|jpeg|png|gif|webp)$/i,
  })
  @UseInterceptors(
    EmptyBodyInterceptor,
    FileInterceptor('image', getMulterOptions()),
    FileUploadInterceptor,
    FileCleanupInterceptor,
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateProductDto,
    @Req() req: Request,
  ): Promise<CRUDReturn> {
    return await this.productService.update(id, body, req.fileData);
  }

  @Delete('/:id')
  async delete(@Param('id', ParseIntPipe) id: number): Promise<CRUDReturn> {
    return await this.productService.delete(id);
  }

  @Post('/:id/buy')
  async buyProduct(@Param('id', ParseIntPipe) id: number): Promise<CRUDReturn> {
    return await this.productService.buyProduct(id);
  }

  @Put('/:id/mark-available')
  async markAvailable(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CRUDReturn> {
    return await this.productService.markAvailable(id);
  }
}
