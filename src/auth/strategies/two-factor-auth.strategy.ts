import { BadRequestException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { LanguageService } from 'src/language/language.service';
import { verify } from 'otplib';
import { AuthService } from '../auth.service';

@Injectable()
export class TwoFactorAuthStrategy extends PassportStrategy(
  Strategy,
  'two-factor',
) {
  constructor(
    private languageService: LanguageService,
    private authService: AuthService,
  ) {
    super({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
    });
  }

  async validate(req: any, email: string, password: string): Promise<any> {
    const { code } = req.body;

    if (!code) {
      throw new BadRequestException(
        this.languageService.getText().controller.auth.invalid_2fa_code,
      );
    }

    const user = await this.authService.verifyUser(email, password);

    if (!user.twoFactorAuthSecret) {
      throw new BadRequestException(
        this.languageService.getText().controller.auth['2fa_not_setup'],
      );
    }

    // Verify OTP
    const isValid = await verify({
      secret: user.twoFactorAuthSecret,
      token: code,
    });

    if (!isValid) {
      throw new BadRequestException(
        this.languageService.getText().controller.auth.invalid_2fa_code,
      );
    }

    // Remove sensitive data before returning
    const { password: _, twoFactorAuthSecret: __, ...result } = user;
    return result;
  }
}
