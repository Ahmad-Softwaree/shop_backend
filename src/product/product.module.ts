import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { UploadService } from 'src/upload/upload.service';
import { AuthModule } from 'src/auth/auth.module';
import { ProductGateway } from './product.gateway';

@Module({
  imports: [AuthModule],
  controllers: [ProductController],
  providers: [ProductService, UploadService, ProductGateway],
  exports: [ProductService],
})
export class ProductModule {}
