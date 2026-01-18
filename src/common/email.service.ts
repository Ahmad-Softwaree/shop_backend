import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  private resend: Resend;

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      let resend = new Resend(process.env.RESEND_API_KEY);
      if (!process.env.RESEND_API_KEY) {
        console.log('📧 Email would be sent (RESEND_API_KEY not configured):');
        console.log('To:', options.to);
        return;
      }

      await resend.emails.send({
        from: 'onboarding@resend.dev',
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
