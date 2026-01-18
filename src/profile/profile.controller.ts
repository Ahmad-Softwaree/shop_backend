import { Body, Controller, Put, UseInterceptors } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/profile.dto';
import { EmptyBodyInterceptor } from 'src/common/interceptors/check-empty-body.interceptor';
import { MessageResponse } from 'src/types/global';

@Controller('users')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Put(':id')
  @UseInterceptors(EmptyBodyInterceptor)
  async updateProfile(
    @Body() body: UpdateProfileDto,
  ): Promise<MessageResponse> {
    return this.profileService.updateProfile(body);
  }
}
