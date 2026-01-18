import { Module, Global } from '@nestjs/common';
import { SharedService } from './shared.service';
import { SharedController } from './shared.controller';
import { UploadModule } from 'src/upload/upload.module';

@Global()
@Module({
  controllers: [SharedController],
  providers: [SharedService],
  exports: [SharedService],
  imports: [UploadModule],
})
export class SharedModule {}
