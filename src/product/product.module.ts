import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { UploadService } from 'src/upload/upload.service';

@Module({
  controllers: [ProductController],
  providers: [ProductService, UploadService],
})
export class ProductModule {}
