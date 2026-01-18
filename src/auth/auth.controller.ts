import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  ChangePasswordDto,
  PasswordResetDto,
  UpdatePasswordDto,
  Activate2FADto,
} from './dto/auth.dto';
import { VerifyOtpDto, ResendOtpDto } from './dto/otp.dto';
import { EmptyBodyInterceptor } from 'src/common/interceptors/check-empty-body.interceptor';
import {
  SameOldPasswordMetadata,
  PasswordHashingInterceptor,
  SameOldPasswordInterceptor,
  CheckBothPasswordInterceptor,
} from 'src/common/interceptors/password.interceptor';
import { Public } from 'src/decorators/public.decorator';
import { MessageResponse } from 'src/types/global';
import { ENUMs } from 'lib/enums';
import { LoginType } from 'src/types/auth';
import { CurrentUser } from './current-user.decorator';
import { Response } from 'express';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { TwoFactorAuthGuard } from './guards/two-factor-auth.guard';
import { User } from 'src/generated/prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseInterceptors(
    EmptyBodyInterceptor,
    CheckBothPasswordInterceptor,
    PasswordHashingInterceptor,
  )
  @Post('register')
  async register(@Body() body: RegisterDto): Promise<MessageResponse> {
    return this.authService.register(body);
  }

  @Public()
  @UseInterceptors(EmptyBodyInterceptor)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginType> {
    return this.authService.login(user, res);
  }

  @Public()
  @UseInterceptors(EmptyBodyInterceptor)
  @UseGuards(TwoFactorAuthGuard)
  @Post('verify-2fa')
  async checkLoginOtp(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginType> {
    return this.authService.checkLoginOtp(user, res);
  }

  @SameOldPasswordMetadata({
    table: ENUMs.TABLES.USER,
    identityField: 'id',
    passwordField: 'password',
  })
  @UseInterceptors(
    EmptyBodyInterceptor,
    SameOldPasswordInterceptor,
    CheckBothPasswordInterceptor,
    PasswordHashingInterceptor,
  )
  @Post('change-password')
  async changePassword(
    @Body() body: ChangePasswordDto,
  ): Promise<MessageResponse> {
    return this.authService.changePassword(body);
  }

  @Public()
  @UseInterceptors(EmptyBodyInterceptor)
  @Post('password-reset')
  async passwordReset(
    @Body() body: PasswordResetDto,
  ): Promise<MessageResponse> {
    return this.authService.passwordReset(body);
  }

  @Public()
  @UseInterceptors(
    EmptyBodyInterceptor,
    CheckBothPasswordInterceptor,
    PasswordHashingInterceptor,
  )
  @Post('update-password')
  async updatePassword(
    @Body() body: UpdatePasswordDto,
  ): Promise<MessageResponse> {
    return this.authService.updatePassword(body);
  }

  @Get('2fa/secret')
  async get2FASecret(): Promise<{ secret: string }> {
    return this.authService.get2FASecret();
  }

  @UseInterceptors(EmptyBodyInterceptor)
  @Post('2fa/activate')
  async activate2FA(@Body() body: Activate2FADto): Promise<MessageResponse> {
    return this.authService.activate2FA(body);
  }

  @Post('2fa/deactivate')
  async deactivate2FA(): Promise<MessageResponse> {
    return this.authService.deactivate2FA();
  }

  @Get('')
  async getAuth(): Promise<Partial<User>> {
    return await this.authService.getAuth();
  }

  @Public()
  @UseInterceptors(EmptyBodyInterceptor)
  @Post('verify-otp')
  async verifyOtp(@Body() body: VerifyOtpDto): Promise<MessageResponse> {
    return this.authService.verifyOtp(body);
  }

  @Public()
  @UseInterceptors(EmptyBodyInterceptor)
  @Post('resend-otp')
  async resendOtp(@Body() body: ResendOtpDto): Promise<MessageResponse> {
    return this.authService.resendOtp(body);
  }

  @Post('logout')
  async logout(
    @Res({ passthrough: true }) res: Response,
  ): Promise<MessageResponse> {
    return this.authService.logout(res);
  }

  @Public()
  @Get('verify-reset-password-token/:token')
  async verifyResetPasswordToken(
    @Param('token') token: string,
  ): Promise<MessageResponse> {
    return this.authService.verifyResetPasswordToken(token);
  }
}
