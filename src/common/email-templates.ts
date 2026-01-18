export const EmailTemplates = {
  accountVerification: (data: {
    name: string;
    code: string;
    lang: 'en' | 'ar' | 'ckb';
  }) => {
    const content = {
      en: {
        greeting: `Hello ${data.name},`,
        message:
          'Thank you for registering! Please verify your account using the code below:',
        codeLabel: 'Verification Code:',
        expires: 'This code expires in 10 minutes.',
        ignore: 'If you did not create an account, please ignore this email.',
      },
      ar: {
        greeting: `مرحباً ${data.name}،`,
        message: 'شكراً للتسجيل! يرجى التحقق من حسابك باستخدام الرمز أدناه:',
        codeLabel: 'رمز التحقق:',
        expires: 'تنتهي صلاحية هذا الرمز خلال 10 دقائق.',
        ignore: 'إذا لم تقم بإنشاء حساب، يرجى تجاهل هذا البريد الإلكتروني.',
      },
      ckb: {
        greeting: `سڵاو ${data.name}،`,
        message:
          'سوپاس بۆ تۆمارکردن! تکایە هەژمارەکەت بسەلمێنە بە بەکارهێنانی کۆدی خوارەوە:',
        codeLabel: 'کۆدی سەلماندن:',
        expires: 'ئەم کۆدە لە ماوەی 10 خولەکدا بەسەردەچێت.',
        ignore: 'ئەگەر هەژمارێکت دروست نەکردووە، تکایە ئەم ئیمەیڵە پشتگوێ بخە.',
      },
    };

    const t = content[data.lang];

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .code-box { background-color: white; border: 2px solid #4f46e5; padding: 20px; margin: 20px 0; text-align: center; border-radius: 8px; }
            .code { font-size: 32px; font-weight: bold; color: #4f46e5; letter-spacing: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Account Verification</h1>
            </div>
            <div class="content">
              <p>${t.greeting}</p>
              <p>${t.message}</p>
              <div class="code-box">
                <p style="margin: 0; font-size: 14px; color: #6b7280;">${t.codeLabel}</p>
                <div class="code">${data.code}</div>
              </div>
              <p style="color: #dc2626;">${t.expires}</p>
              <p style="color: #6b7280; font-size: 14px;">${t.ignore}</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Shop. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  },

  passwordReset: (data: {
    name: string;
    resetLink: string;
    lang: 'en' | 'ar' | 'ckb';
  }) => {
    const content = {
      en: {
        greeting: `Hello ${data.name},`,
        message:
          'We received a request to reset your password. Click the button below to reset it:',
        button: 'Reset Password',
        expires: 'This link expires in 1 hour.',
        ignore:
          'If you did not request a password reset, please ignore this email.',
      },
      ar: {
        greeting: `مرحباً ${data.name}،`,
        message:
          'تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بك. انقر فوق الزر أدناه لإعادة تعيينها:',
        button: 'إعادة تعيين كلمة المرور',
        expires: 'تنتهي صلاحية هذا الرابط خلال ساعة واحدة.',
        ignore:
          'إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد الإلكتروني.',
      },
      ckb: {
        greeting: `سڵاو ${data.name}،`,
        message:
          'داوای ڕێکخستنەوەی وشەی نهێنیت وەرگرتووە. کرتە لەسەر دوگمەی خوارەوە بکە بۆ ڕێکخستنەوەی:',
        button: 'ڕێکخستنەوەی وشەی نهێنی',
        expires: 'ئەم لینکە لە ماوەی یەک کاتژمێردا بەسەردەچێت.',
        ignore:
          'ئەگەر داوای ڕێکخستنەوەی وشەی نهێنیت نەکردووە، تکایە ئەم ئیمەیڵە پشتگوێ بخە.',
      },
    };

    const t = content[data.lang];

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background-color: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset</h1>
            </div>
            <div class="content">
              <p>${t.greeting}</p>
              <p>${t.message}</p>
              <div style="text-align: center;">
                <a href="${data.resetLink}" class="button">${t.button}</a>
              </div>
              <p style="color: #dc2626;">${t.expires}</p>
              <p style="color: #6b7280; font-size: 14px;">${t.ignore}</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Shop. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  },

  twoFactorCode: (data: {
    name: string;
    code: string;
    lang: 'en' | 'ar' | 'ckb';
  }) => {
    const content = {
      en: {
        greeting: `Hello ${data.name},`,
        message: 'Your two-factor authentication code is:',
        codeLabel: 'Authentication Code:',
        expires: 'This code expires in 5 minutes.',
        ignore:
          'If you did not attempt to log in, please secure your account immediately.',
      },
      ar: {
        greeting: `مرحباً ${data.name}،`,
        message: 'رمز المصادقة الثنائية الخاص بك هو:',
        codeLabel: 'رمز المصادقة:',
        expires: 'تنتهي صلاحية هذا الرمز خلال 5 دقائق.',
        ignore: 'إذا لم تحاول تسجيل الدخول، يرجى تأمين حسابك على الفور.',
      },
      ckb: {
        greeting: `سڵاو ${data.name}،`,
        message: 'کۆدی سەلماندنی دوو هەنگاوی تۆ ئەمەیە:',
        codeLabel: 'کۆدی سەلماندن:',
        expires: 'ئەم کۆدە لە ماوەی 5 خولەکدا بەسەردەچێت.',
        ignore:
          'ئەگەر هەوڵی چوونەژوورەوەت نەداوە، تکایە دەستبەجێ هەژمارەکەت بپارێزە.',
      },
    };

    const t = content[data.lang];

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .code-box { background-color: white; border: 2px solid #059669; padding: 20px; margin: 20px 0; text-align: center; border-radius: 8px; }
            .code { font-size: 32px; font-weight: bold; color: #059669; letter-spacing: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Two-Factor Authentication</h1>
            </div>
            <div class="content">
              <p>${t.greeting}</p>
              <p>${t.message}</p>
              <div class="code-box">
                <p style="margin: 0; font-size: 14px; color: #6b7280;">${t.codeLabel}</p>
                <div class="code">${data.code}</div>
              </div>
              <p style="color: #dc2626;">${t.expires}</p>
              <p style="color: #6b7280; font-size: 14px;">${t.ignore}</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Shop. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  },
};
