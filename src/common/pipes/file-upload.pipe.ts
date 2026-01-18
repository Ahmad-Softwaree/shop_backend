import { Injectable, PipeTransform } from '@nestjs/common';
import {
  MaxFileSizeValidator,
  FileTypeValidator,
  ParseFilePipe,
} from '@nestjs/common';

@Injectable()
export class ImageValidationPipe implements PipeTransform {
  constructor(
    private readonly maxSize = 5 * 1024 * 1024,
    private readonly fileTypes = /(jpg|jpeg|png|gif)$/,
  ) {}

  transform(file: Express.Multer.File) {
    return new ParseFilePipe({
      fileIsRequired: true,
      validators: [
        new MaxFileSizeValidator({ maxSize: this.maxSize }),
        new FileTypeValidator({ fileType: this.fileTypes }),
      ],
    }).transform(file);
  }
}
