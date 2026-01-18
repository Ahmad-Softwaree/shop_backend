import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { EnvironmentVariables } from 'src/core/configuration';
import { JWTPayload } from 'src/types/auth';
import { ClsService } from 'nestjs-cls';
import { ClsValues } from 'src/core/core.module';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService<EnvironmentVariables>,
    private clsService: ClsService<ClsValues>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          console.log(
            request.cookies[configService.get<string>('COOKIE_NAME')],
          );
          return request.cookies[configService.get<string>('COOKIE_NAME')];
        },
      ]),
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  validate(payload: JWTPayload) {
    this.clsService.set('userId', payload.userId);
    return payload;
  }
}
