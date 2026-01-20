import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ProfileModule } from './profile/profile.module';
import { APP_GUARD } from '@nestjs/core';
import { LanguageModule } from './language/language.module';
import { CoreModule } from './core/core.module';
import { PrismaModule } from './prisma.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { ProductModule } from './product/product.module';
import { SharedModule } from './shared/shared.module';
import { CheckoutModule } from './checkout/checkout.module';

@Module({
  imports: [
    CoreModule,
    PrismaModule,
    LanguageModule,
    AuthModule,
    UserModule,
    ProfileModule,
    ProductModule,
    SharedModule,
    CheckoutModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
