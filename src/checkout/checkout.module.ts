import { Module } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CheckoutController } from './checkout.controller';
import Stripe from 'stripe';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/core/configuration';
import { ProductModule } from 'src/product/product.module';

@Module({
  imports: [ConfigModule, ProductModule],
  controllers: [CheckoutController],
  providers: [
    CheckoutService,
    {
      provide: Stripe,
      useFactory: (configService: ConfigService<EnvironmentVariables>) => {
        return new Stripe(configService.get<string>('STRIPE_SECRET_KEY')!);
      },
      inject: [ConfigService],
    },
  ],
})
export class CheckoutModule {}
