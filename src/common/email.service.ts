import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { EnvironmentVariables } from 'src/core/configuration';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}
  private resend: Resend;

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      let resend = new Resend(this.configService.get('RESEND_API_KEY'));
      if (!this.configService.get('RESEND_API_KEY')) {
        console.log('📧 Email would be sent (RESEND_API_KEY not configured):');
        console.log('To:', options.to);
        return;
      }

      await resend.emails.send({
        from:
          this.configService.get('EMAIL_FROM') ||
          'onboarding@shop-email.ahmad-software.com',
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      console.log('✅ Email sent successfully to:', options.to);
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      throw error;
    }
  }
}
