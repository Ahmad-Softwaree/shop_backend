import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { LanguageService } from 'src/language/language.service';
import { ClsService } from 'nestjs-cls';
import { ClsValues } from 'src/core/core.module';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import {
  CRUDReturn,
  PaginationParams,
  PaginationType,
  QueryParam,
  RegularType,
} from 'src/types/global';
import { Prisma, Product } from 'src/generated/prisma/client';
import { buildPagination } from 'lib/functions';
import { UploadService } from 'src/upload/upload.service';

@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private languageService: LanguageService,
    private clsService: ClsService<ClsValues>,
    private uploadService: UploadService,
  ) {}

  async get(
    pagination: PaginationParams,
    query: QueryParam,
    user?: boolean,
  ): Promise<PaginationType<Partial<Product>>> {
    console.log('here');
    const { page, limit } = pagination;
    const { search } = query;

    const where: Prisma.ProductWhereInput = {};

    // Search by name in all three languages
    if (search) {
      where.OR = [
        { enName: { contains: search, mode: 'insensitive' } },
        { arName: { contains: search, mode: 'insensitive' } },
        { ckbName: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (user) {
      where.userId = this.clsService.get('userId');
    }

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              username: true,
              phone: true,
            },
          },
          orders: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  phone: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    const meta = buildPagination(total, page, limit);

    return {
      data,
      ...meta,
    };
  }

  async getOne(id: number): Promise<RegularType<Partial<Product>>> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            username: true,
            phone: true,
          },
        },
        orders: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(
        this.languageService.getText().controller.product.not_found,
      );
    }

    return { data: product };
  }

  async insert(body: CreateProductDto, fileData?: any): Promise<CRUDReturn> {
    console.log(fileData);
    const product = await this.prisma.product.create({
      data: {
        ...body,
        image: fileData?.image,
        userId: this.clsService.get('userId')!,
      },
    });

    return {
      message: this.languageService.getText().controller.product.create_success,
      data: product,
    };
  }

  async update(
    id: number,
    body: UpdateProductDto,
    fileData?: any,
  ): Promise<CRUDReturn> {
    // Check if product exists and belongs to the user
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(
        this.languageService.getText().controller.product.not_found,
      );
    }

    if (product.userId !== this.clsService.get('userId')) {
      throw new ForbiddenException(
        this.languageService.getText().controller.product.unauthorized,
      );
    }

    // If new image uploaded, delete old image
    if (fileData?.image && product.image) {
      await this.uploadService.deleteFileByUrl(product.image);
    }

    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: {
        ...body,
        image: fileData?.image || product.image,
      },
    });

    return {
      message: this.languageService.getText().controller.product.update_success,
      data: updatedProduct,
    };
  }

  async delete(id: number): Promise<CRUDReturn> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(
        this.languageService.getText().controller.product.not_found,
      );
    }

    if (product.userId !== this.clsService.get('userId')) {
      throw new ForbiddenException(
        this.languageService.getText().controller.product.unauthorized,
      );
    }

    // Delete product image before deleting the product
    if (product.image) {
      await this.uploadService.deleteFileByUrl(product.image);
    }

    await this.prisma.product.delete({
      where: { id },
    });

    return {
      message: this.languageService.getText().controller.product.delete_success,
    };
  }

  async buyProduct(id: number): Promise<CRUDReturn> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(
        this.languageService.getText().controller.product.not_found,
      );
    }

    // Check if product is already sold
    if (product.status === 'SOLD_OUT') {
      throw new ForbiddenException(
        this.languageService.getText().controller.product.already_sold,
      );
    }

    const userId = this.clsService.get('userId');

    // Check if user is trying to buy their own product
    if (product.userId === userId) {
      throw new ForbiddenException(
        this.languageService.getText().controller.product.cannot_buy_own,
      );
    }

    // Update product status and create user order
    await this.prisma.$transaction([
      this.prisma.product.update({
        where: { id },
        data: { status: 'SOLD_OUT' },
      }),
      this.prisma.userOrder.create({
        data: {
          userId: userId!,
          productId: id,
        },
      }),
    ]);

    return {
      message: this.languageService.getText().controller.product.buy_success,
    };
  }

  async markAvailable(id: number): Promise<CRUDReturn> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(
        this.languageService.getText().controller.product.not_found,
      );
    }

    // Only owner can mark as available
    if (product.userId !== this.clsService.get('userId')) {
      throw new ForbiddenException(
        this.languageService.getText().controller.product.unauthorized,
      );
    }

    // Check if product is sold
    if (product.status !== 'SOLD_OUT') {
      throw new ForbiddenException(
        this.languageService.getText().controller.product.not_sold_yet,
      );
    }

    // Update product status and delete user order
    await this.prisma.$transaction([
      this.prisma.product.update({
        where: { id },
        data: { status: 'AVAILABLE' },
      }),
      this.prisma.userOrder.deleteMany({
        where: { productId: id },
      }),
    ]);

    return {
      message:
        this.languageService.getText().controller.product
          .mark_available_success,
    };
  }
}
