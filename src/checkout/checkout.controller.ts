import { Body, Controller, Post, RawBodyRequest, Req } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CheckoutDTO } from './dto/checkout.dto';
import Stripe from 'stripe';
import { Request } from 'express';
import { Public } from 'src/decorators/public.decorator';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post('session')
  async createCheckoutSession(
    @Body() body: CheckoutDTO,
  ): Promise<Stripe.Checkout.Session> {
    return this.checkoutService.createCheckoutSession(body.productId);
  }

  @Public()
  @Post('webhook')
  async handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
  ): Promise<void> {
    return this.checkoutService.handleStripeWebhook(req);
  }
}
