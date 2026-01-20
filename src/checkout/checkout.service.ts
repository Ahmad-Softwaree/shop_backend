import { Injectable, RawBodyRequest } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { EnvironmentVariables } from 'src/core/configuration';
import { ProductService } from 'src/product/product.service';
import Stripe from 'stripe';

@Injectable()
export class CheckoutService {
  constructor(
    private stripe: Stripe,
    private productService: ProductService,
    private configService: ConfigService<EnvironmentVariables>,
  ) {}

  async createCheckoutSession(
    productId: number,
  ): Promise<Stripe.Checkout.Session> {
    const product = await this.productService.getOne(productId);

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      metadata: {
        productId: product.data.id.toString(),
        userId: product.data.userId.toString(),
      },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.data.enName,
              images: [product.data.image],
            },
            unit_amount: product.data.price * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${this.configService.getOrThrow<string>('FRONT_URL')}${this.configService.getOrThrow<string>('SUCCESS_URL')!}`,
      cancel_url: `${this.configService.getOrThrow<string>('FRONT_URL')}${this.configService.getOrThrow<string>('CANCEL_URL')!}`,
    });
    return session;
  }

  async handleStripeWebhook(request: RawBodyRequest<Request>): Promise<void> {
    const sig = request.headers['stripe-signature'] as string;
    let webhookSecret = this.configService.getOrThrow<string>(
      'STRIPE_WEBHOOK_SECRET',
    );
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        request.rawBody,
        sig,
        webhookSecret,
      );
    } catch (error: any) {
      throw new Error(`Webhook Error: ${error.message}`);
    }
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const productId = session.metadata.productId;
      const userId = session.metadata.userId;

      // Update product status and create user order
      await this.productService.handleSuccessfulCheckout(
        Number(productId),
        Number(userId),
      );
    }
  }
}
