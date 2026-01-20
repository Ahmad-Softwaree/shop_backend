import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Language, LanguageService } from 'src/language/language.service';
import { JWTPayload, LoginType } from 'src/types/auth';
import { MessageResponse } from 'src/types/global';
import {
  RegisterDto,
  ChangePasswordDto,
  PasswordResetDto,
  UpdatePasswordDto,
  Activate2FADto,
} from './dto/auth.dto';
import { VerifyOtpDto, ResendOtpDto } from './dto/otp.dto';
import { JwtService } from '@nestjs/jwt';
import { ClsService } from 'nestjs-cls';
import { PrismaService } from 'src/prisma.service';
import { randomBytes } from 'crypto';
import { generateSecret, generate, verify, generateURI } from 'otplib';
import { EmailService } from 'src/common/email.service';
import { EmailTemplates } from 'src/common/email-templates';
import { UserService } from 'src/user/user.service';
import { Response } from 'express';
import ms from 'ms';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/core/configuration';
import { ClsValues } from 'src/core/core.module';
import { User } from 'src/generated/prisma/client';
@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private languageService: LanguageService,
    private clsService: ClsService<ClsValues>,
    private emailService: EmailService,
    private userService: UserService,
    private configService: ConfigService<EnvironmentVariables>,
  ) {}

  private async generateJwtToken(user: Partial<User>): Promise<string> {
    const payload: JWTPayload = {
      userId: user.id!,
    };
    return this.jwtService.sign(payload);
  }

  async verifyToken(jwt: string): Promise<JWTPayload> {
    const payload = this.jwtService.verify<JWTPayload>(jwt);
    return payload;
  }

  async verifyUser(email: string, password: string): Promise<User> {
    try {
      const user = await this.userService.getUser({ email });
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        throw new UnauthorizedException(
          this.languageService.getText().controller.auth.wrong_credentials,
        );
      }
      return user;
    } catch (error) {
      throw new UnauthorizedException(
        this.languageService.getText().controller.auth.wrong_credentials,
      );
    }
  }

  async register(body: RegisterDto): Promise<MessageResponse> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      throw new BadRequestException(
        this.languageService.getText().controller.auth.email_in_use,
      );
    }

    const existingUsername = await this.prisma.user.findUnique({
      where: { username: body.username },
    });

    if (existingUsername) {
      throw new BadRequestException(
        this.languageService.getText().controller.auth.username_in_use,
      );
    }

    const user = await this.prisma.user.create({
      data: {
        name: body.name,
        username: body.username,
        email: body.email,
        password: body.password,
        phone: body.phone,
        isAuthenticated: false,
      },
    });

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP
    await this.prisma.otp.create({
      data: {
        userId: user.id,
        code,
        expiresAt,
      },
    });

    // Send OTP email
    const lang = this.languageService.getCurrentLanguage() as Language;
    await this.emailService.sendEmail({
      to: user.email,
      subject: 'Verify Your Account',
      html: EmailTemplates.accountVerification({
        name: user.name,
        code,
        lang,
      }),
    });

    return {
      message: this.languageService.getText().controller.auth.register_success,
    };
  }

  async login(user: User, response: Response): Promise<LoginType> {
    const expires = new Date();
    expires.setMilliseconds(
      expires.getMilliseconds() +
        ms(
          this.configService.getOrThrow<string>(
            'JWT_EXPIRATION',
          ) as ms.StringValue,
        ),
    );

    let jwt = await this.generateJwtToken(user);

    response.cookie(this.configService.getOrThrow<string>('COOKIE_NAME'), jwt, {
      httpOnly: true,
      expires,
      secure: true,
    });
    return {
      jwt,
      user,
    };
  }

  async checkLoginOtp(user: User, response: Response): Promise<LoginType> {
    const expires = new Date();
    expires.setMilliseconds(
      expires.getMilliseconds() +
        ms(
          this.configService.getOrThrow<string>(
            'JWT_EXPIRATION',
          ) as ms.StringValue,
        ),
    );

    let jwt = await this.generateJwtToken(user);

    response.cookie(this.configService.getOrThrow<string>('COOKIE_NAME'), jwt, {
      httpOnly: true,
      expires,
      secure: true,
    });

    return {
      jwt,
      user,
    };
  }

  async changePassword(body: ChangePasswordDto): Promise<MessageResponse> {
    await this.prisma.user.update({
      where: { id: this.clsService.get('userId') },
      data: {
        password: body.password,
        updatedAt: new Date(),
      },
    });
    return {
      message:
        this.languageService.getText().controller.auth.password_change_success,
    };
  }

  async passwordReset(body: PasswordResetDto): Promise<MessageResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: body.email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return {
        message:
          this.languageService.getText().controller.auth
            .password_reset_email_sent,
      };
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour from now

    // Upsert password reset token
    await this.prisma.passwordReset.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        token: token,
        tokenExpiry: expiresAt,
      },
      update: {
        token: token,
        tokenExpiry: expiresAt,
      },
    });

    // Send password reset email
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/update-password?token=${token}`;
    const lang = this.languageService.getCurrentLanguage() as Language;

    await this.emailService.sendEmail({
      to: user.email,
      subject: 'Reset Your Password',
      html: EmailTemplates.passwordReset({
        name: user.name,
        resetLink: resetUrl,
        lang,
      }),
    });

    return {
      message:
        this.languageService.getText().controller.auth
          .password_reset_email_sent,
    };
  }

  async updatePassword(body: UpdatePasswordDto): Promise<MessageResponse> {
    const passwordResetToken = await this.prisma.passwordReset.findUnique({
      where: { token: body.token },
    });

    if (!passwordResetToken) {
      throw new BadRequestException(
        this.languageService.getText().controller.auth.invalid_token,
      );
    }

    const now = new Date();
    if (now > passwordResetToken.tokenExpiry) {
      throw new BadRequestException(
        this.languageService.getText().controller.auth.expired_token,
      );
    }

    await this.prisma.$transaction(async (prisma) => {
      await prisma.user.update({
        where: { id: passwordResetToken.userId },
        data: {
          password: body.password,
          updatedAt: new Date(),
        },
      });

      await prisma.passwordReset.delete({
        where: { token: body.token },
      });
    });

    return {
      message:
        this.languageService.getText().controller.auth.password_update_success,
    };
  }

  async get2FASecret(): Promise<{ secret: string }> {
    let user = await this.prisma.user.findUnique({
      where: { id: this.clsService.get('userId') },
    });

    let twoFactorAuthSecret = user.twoFactorAuthSecret;

    if (!twoFactorAuthSecret) {
      const secret = generateSecret();
      const token = await generate({ secret });
      const isValid = await verify({ secret, token });
      if (!isValid.valid) {
        throw new BadRequestException(
          this.languageService.getText().controller.auth
            .failed_2fa_secret_generation,
        );
      }

      generateURI({
        issuer: process.env.NEXT_PUBLIC_APP_NAME || 'Shop App',
        label: user.email,
        secret,
      });
      twoFactorAuthSecret = secret;

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          twoFactorAuthSecret: secret,
          updatedAt: new Date(),
        },
      });
    }

    return { secret: twoFactorAuthSecret };
  }

  async activate2FA(body: Activate2FADto): Promise<MessageResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: this.clsService.get('userId') },
    });

    if (!user.twoFactorAuthSecret) {
      throw new BadRequestException(
        this.languageService.getText().controller.auth['2fa_not_setup'],
      );
    }

    const isValid = await verify({
      secret: user.twoFactorAuthSecret,
      token: body.code,
    });

    if (!isValid.valid) {
      throw new BadRequestException(
        this.languageService.getText().controller.auth.invalid_2fa_code,
      );
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorAuthEnabled: true,
        updatedAt: new Date(),
      },
    });

    return {
      message:
        this.languageService.getText().controller.auth['2fa_activate_success'],
    };
  }

  async deactivate2FA(): Promise<MessageResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: this.clsService.get('userId') },
    });

    if (!user) {
      throw new NotFoundException(
        this.languageService.getText().controller.auth.user_not_found,
      );
    }

    await this.prisma.user.update({
      where: { id: this.clsService.get('userId') },
      data: {
        twoFactorAuthEnabled: false,
        twoFactorAuthSecret: null,
        updatedAt: new Date(),
      },
    });

    return {
      message:
        this.languageService.getText().controller.auth[
          '2fa_deactivate_success'
        ],
    };
  }

  async getAuth(): Promise<Partial<User>> {
    const user = await this.prisma.user.findUnique({
      where: { id: this.clsService.get('userId') },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        phone: true,
        twoFactorAuthEnabled: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async verifyOtp(body: VerifyOtpDto): Promise<MessageResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: body.email },
      include: { otp: true },
    });

    if (!user) {
      throw new NotFoundException(
        this.languageService.getText().controller.auth.user_not_found,
      );
    }

    if (!user.otp) {
      throw new BadRequestException(
        this.languageService.getText().controller.auth.no_otp_found,
      );
    }

    const now = new Date();
    if (now > user.otp.expiresAt) {
      throw new BadRequestException(
        this.languageService.getText().controller.auth.otp_expired,
      );
    }

    if (user.otp.code !== body.code) {
      throw new BadRequestException(
        this.languageService.getText().controller.auth.invalid_otp,
      );
    }

    // Mark user as authenticated and delete OTP
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: { isAuthenticated: true },
      }),
      this.prisma.otp.delete({
        where: { userId: user.id },
      }),
    ]);

    return {
      message: this.languageService.getText().controller.auth.account_verified,
    };
  }

  async resendOtp(body: ResendOtpDto): Promise<MessageResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: body.email },
    });

    if (!user) {
      throw new NotFoundException(
        this.languageService.getText().controller.auth.user_not_found,
      );
    }

    if (user.isAuthenticated) {
      throw new BadRequestException(
        this.languageService.getText().controller.auth.already_verified,
      );
    }

    // Generate new OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.prisma.otp.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        code,
        expiresAt,
      },
      update: {
        code,
        expiresAt,
      },
    });

    // Send OTP email
    const lang = this.languageService.getCurrentLanguage() as Language;
    await this.emailService.sendEmail({
      to: user.email,
      subject: 'Verify Your Account',
      html: EmailTemplates.accountVerification({
        name: user.name,
        code,
        lang,
      }),
    });

    return {
      message: this.languageService.getText().controller.auth.otp_sent,
    };
  }

  async logout(res: Response): Promise<MessageResponse> {
    res.clearCookie(this.configService.getOrThrow<string>('COOKIE_NAME'), {
      httpOnly: true,
      secure: true,
    });
    return {
      message: this.languageService.getText().controller.auth.logout_success,
    };
  }

  async verifyResetPasswordToken(token: string): Promise<MessageResponse> {
    const passwordResetToken = await this.prisma.passwordReset.findUnique({
      where: { token: token },
    });
    if (!passwordResetToken) {
      throw new BadRequestException(
        this.languageService.getText().controller.auth.invalid_token,
      );
    }
    const now = new Date();
    if (now > passwordResetToken.tokenExpiry) {
      throw new BadRequestException(
        this.languageService.getText().controller.auth.expired_token,
      );
    }
    return {
      message: 'VALID_RESET_TOKEN',
    };
  }
}
