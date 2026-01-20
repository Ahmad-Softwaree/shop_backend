import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule } from '@nestjs/throttler';
import { ClsModule, ClsStore } from 'nestjs-cls';
import { join } from 'path';
import { LoggerModule } from 'nestjs-pino';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration, { EnvironmentVariables } from './configuration';

export interface ClsValues extends ClsStore {
  lang: string;
  userId: number | null;
}

@Module({
  imports: [
    // LoggerModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: (configService: ConfigService<EnvironmentVariables>) => {
    //     let isProduction =
    //       configService.getOrThrow<string>('NODE_ENV') === 'production';
    //     return {
    //       pinoHttp: {
    //         level: isProduction ? 'info' : 'debug',
    //         transport: isProduction
    //           ? undefined
    //           : {
    //               target: 'pino-pretty',
    //               options: {
    //                 colorize: true,
    //                 translateTime: 'SYS:standard',
    //                 ignore: 'pid,hostname',
    //               },
    //             },
    //       },
    //     };
    //   },
    //   inject: [ConfigService],
    // }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ClsModule.forRoot({
      middleware: {
        mount: true,
        setup: (cls, req) => {
          cls.set('lang', req.headers['x-lang'] || 'en');
          cls.set(
            'userId',
            req.headers['x-user-id']
              ? parseInt(req.headers['x-user-id'] as string, 10)
              : null,
          );
        },
      },
      global: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    MulterModule.register({
      dest: join(process.cwd(), 'uploads'),
    }),

    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
  ],
})
export class CoreModule {}
