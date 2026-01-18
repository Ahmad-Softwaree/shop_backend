import { Controller, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { SharedService } from './shared.service';
import { CRUDReturn } from 'src/types/global';

@Controller('shared')
export class SharedController {
  constructor(private readonly sharedService: SharedService) {}

  @Delete('delete_old_image')
  async deleteOldImage(
    @Query('table') table: string,
    @Query('bucket') bucket: string,
    @Query('id', ParseIntPipe) id: number,
  ): Promise<CRUDReturn> {
    return await this.sharedService.deleteOldImage(table, id, bucket);
  }
}
