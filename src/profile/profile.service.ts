import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { PrismaService } from 'src/prisma.service';
import { UpdateProfileDto } from './dto/profile.dto';
import { LanguageService } from 'src/language/language.service';
import { MessageResponse } from 'src/types/global';

@Injectable()
export class ProfileService {
  constructor(
    private prisma: PrismaService,
    private clsService: ClsService,
    private languageService: LanguageService,
  ) {}

  async updateProfile(body: UpdateProfileDto): Promise<MessageResponse> {
    const userId = this.clsService.get('userId');

    if (!userId) {
      throw new UnauthorizedException(
        this.languageService.getText().controller.profile.unauthorized,
      );
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: body.name,
        username: body.username,
        email: body.email,
        phone: body.phone,
      },
    });

    return {
      message: this.languageService.getText().controller.profile.update_success,
    };
  }
}
