import { Injectable } from '@nestjs/common';
import { LanguageService } from 'src/language/language.service';
import { PrismaService } from 'src/prisma.service';
import { CRUDReturn } from 'src/types/global';
import { UploadService } from 'src/upload/upload.service';

@Injectable()
export class SharedService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
    private readonly languageService: LanguageService,
  ) {}

  async deleteOldImage(
    table: string,
    id: number,
    bucket: string,
  ): Promise<CRUDReturn> {
    let record = await this.prisma[table].findUnique({
      where: { id },
      select: { image: true },
    });

    await this.uploadService.deleteFile(`${bucket}/${record.image}`);

    await this.prisma[table].update({
      where: { id },
      data: { image: '' },
    });

    return {
      message: this.languageService.getText().controller.shared.image_deleted,
    };
  }
}
