import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { EmailService } from 'src/common/email.service';
import { PrismaService } from 'src/prisma.service';
import { Language, LanguageService } from 'src/language/language.service';
import { EmailTemplates } from 'src/common/email-templates';
import { User } from 'src/generated/prisma/client';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private prisma: PrismaService,
    private emailService: EmailService,
    private languageService: LanguageService,
  ) {
    super({ usernameField: 'email', passwordField: 'password' });
  }

  async validate(email: string, password: string): Promise<Partial<User>> {
    try {
      const user = await this.authService.verifyUser(email, password);
      if (!user.isAuthenticated) {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
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
        throw new UnauthorizedException({
          message: 'ACCOUNT_NOT_VERIFIED',
        });
      }
      if (user.twoFactorAuthEnabled) {
        throw new UnauthorizedException({
          message: 'TWO_FACTOR_AUTHENTICATION_REQUIRED',
        });
      }
      const { password: _, ...result } = user;
      return result;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException(
        this.languageService.getText().guards.token_destructor_failed,
      );
    }
  }
}
