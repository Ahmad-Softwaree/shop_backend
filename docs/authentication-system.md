# 🔐 Authentication System

This document explains the complete authentication system including JWT tokens, Passport strategies, password management, 2FA (Two-Factor Authentication), OTP verification, and session management.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [JWT Token System](#jwt-token-system)
- [Password Management](#password-management)
- [Two-Factor Authentication (2FA)](#two-factor-authentication-2fa)
- [OTP Verification](#otp-verification)
- [Passport Strategies](#passport-strategies)
- [Auth Guards](#auth-guards)
- [Password Reset Flow](#password-reset-flow)
- [Security Features](#security-features)
- [API Endpoints](#api-endpoints)

---

## 🏗️ Overview

The authentication system is built with **NestJS** and provides:

- **JWT-based authentication** with refresh capabilities
- **bcrypt password hashing** for secure storage
- **TOTP-based 2FA** using `otplib`
- **Email OTP verification** for account activation
- **Password reset** with time-limited tokens
- **Passport.js** strategies for flexible auth
- **Guards** for route protection
- **Interceptors** for automatic password hashing

---

## 🔧 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Auth Module                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  AuthController                                      │   │
│  │  - /auth/login                                       │   │
│  │  - /auth/register                                    │   │
│  │  - /auth/logout                                      │   │
│  │  - /auth/2fa/*                                       │   │
│  │  - /auth/verify-otp                                  │   │
│  │  - /auth/password-reset                              │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  AuthService                                         │   │
│  │  - validateUser()                                    │   │
│  │  - login()                                           │   │
│  │  - register()                                        │   │
│  │  - generate2FASecret()                               │   │
│  │  - verify2FAToken()                                  │   │
│  │  - createPasswordResetToken()                        │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Passport Strategies                                 │   │
│  │  - JwtStrategy (validates JWT tokens)                │   │
│  │  - LocalStrategy (validates email/password)          │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Guards                                              │   │
│  │  - JwtAuthGuard (protects routes)                    │   │
│  │  - LocalAuthGuard (login endpoint)                   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    User Module                               │
│  - UserService (CRUD operations)                             │
│  - Password hashing interceptor                              │
│  - Unique field validation                                   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                   Prisma Database                            │
│  - User model with hashed passwords                          │
│  - 2FA secrets, OTP codes, reset tokens                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎫 JWT Token System

### **Token Generation**

JWT tokens are created when users log in successfully:

**Location:** `src/auth/auth.service.ts`

```typescript
async login(user: User) {
  const payload = {
    email: user.email,
    id: user.id,
    sub: user.id
  };

  return {
    jwt: this.jwtService.sign(payload),
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      twoFactorEnabled: user.twoFactorEnabled,
    },
  };
}
```

### **Token Configuration**

**Location:** `src/auth/auth.module.ts`

```typescript
JwtModule.register({
  secret: process.env.JWT_SECRET,
  signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
});
```

**Environment Variables:**

```env
JWT_SECRET=your-super-secret-key-here
JWT_EXPIRES_IN=7d
```

### **Token Structure**

The JWT payload contains:

```typescript
{
  email: "user@example.com",
  id: 1,
  sub: 1,              // Subject (user ID)
  iat: 1705867200,     // Issued at
  exp: 1706472000      // Expiration
}
```

### **Token Validation**

**Location:** `src/auth/strategies/jwt.strategy.ts`

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    // Payload is already verified by passport-jwt
    const user = await this.userService.findOne(payload.id);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user; // Attached to request.user
  }
}
```

### **Using Tokens in Requests**

**Client-side:**

```typescript
// Add to request headers
headers: {
  'Authorization': `Bearer ${jwtToken}`
}
```

**Server-side extraction:**

- Automatically extracted by `JwtStrategy`
- User object available via `@User()` decorator

---

## 🔒 Password Management

### **Password Hashing**

We use **bcrypt** with automatic hashing via interceptor:

**Location:** `src/common/interceptor/hash-password.interceptor.ts`

```typescript
@Injectable()
export class HashPasswordInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const { password } = request.body;

    if (password) {
      const salt = await bcrypt.genSalt(+process.env.PASSWORD_HASH_SALT || 10);
      request.body.password = await bcrypt.hash(password, salt);
    }

    return next.handle();
  }
}
```

**Applied to:**

- User registration
- Password updates
- Password resets

### **Password Verification**

**Location:** `src/auth/auth.service.ts`

```typescript
async validateUser(email: string, password: string) {
  const user = await this.userService.findByEmail(email);

  if (!user) {
    throw new UnauthorizedException('Invalid credentials');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new UnauthorizedException('Invalid credentials');
  }

  return user;
}
```

### **Password Change**

**Endpoint:** `POST /auth/change-password`

```typescript
async changePassword(userId: number, oldPassword: string, newPassword: string) {
  const user = await this.userService.findOne(userId);

  // Verify old password
  const isValid = await bcrypt.compare(oldPassword, user.password);
  if (!isValid) {
    throw new BadRequestException('Current password is incorrect');
  }

  // Hash new password (interceptor handles this)
  return this.userService.update(userId, { password: newPassword });
}
```

---

## 🔐 Two-Factor Authentication (2FA)

We use **TOTP** (Time-based One-Time Password) with `otplib`:

### **Generating 2FA Secret**

**Endpoint:** `GET /auth/2fa/generate`

```typescript
import { authenticator } from 'otplib';

async generate2FASecret(userId: number) {
  const secret = authenticator.generateSecret();

  // Save to database
  await this.userService.update(userId, {
    twoFactorSecret: secret,
  });

  // Generate QR code URL for authenticator apps
  const otpauthUrl = authenticator.keyuri(
    user.email,
    process.env.NEXT_PUBLIC_APP_NAME || 'Shop',
    secret
  );

  return {
    secret,
    otpauthUrl, // Use this with qrcode library
  };
}
```

### **Activating 2FA**

**Endpoint:** `POST /auth/2fa/activate`

```typescript
async activate2FA(userId: number, token: string) {
  const user = await this.userService.findOne(userId);

  if (!user.twoFactorSecret) {
    throw new BadRequestException('2FA secret not generated');
  }

  // Verify the token from authenticator app
  const isValid = authenticator.verify({
    token,
    secret: user.twoFactorSecret,
  });

  if (!isValid) {
    throw new BadRequestException('Invalid 2FA token');
  }

  // Enable 2FA
  await this.userService.update(userId, {
    twoFactorEnabled: true,
  });

  return { message: '2FA activated successfully' };
}
```

### **Verifying 2FA During Login**

**Endpoint:** `POST /auth/2fa/verify`

```typescript
async verify2FAToken(userId: number, token: string) {
  const user = await this.userService.findOne(userId);

  if (!user.twoFactorEnabled) {
    throw new BadRequestException('2FA is not enabled');
  }

  const isValid = authenticator.verify({
    token,
    secret: user.twoFactorSecret,
  });

  if (!isValid) {
    throw new UnauthorizedException('Invalid 2FA token');
  }

  return this.login(user); // Return JWT token
}
```

### **Login Flow with 2FA**

```
1. User submits email + password
   POST /auth/login
        ↓
2. If 2FA enabled, return special response
   { requires2FA: true, tempToken: "..." }
        ↓
3. Client shows 2FA input
   User enters 6-digit code from app
        ↓
4. Submit 2FA code
   POST /auth/2fa/verify
   Body: { tempToken, code: "123456" }
        ↓
5. Verify code and return JWT
   { jwt: "...", user: {...} }
```

### **Deactivating 2FA**

**Endpoint:** `POST /auth/2fa/deactivate`

```typescript
async deactivate2FA(userId: number) {
  await this.userService.update(userId, {
    twoFactorEnabled: false,
    twoFactorSecret: null,
  });

  return { message: '2FA deactivated successfully' };
}
```

---

## 📧 OTP Verification

Email-based OTP for account verification:

### **Generating OTP**

**Location:** `src/auth/auth.service.ts`

```typescript
async generateOTP(userId: number) {
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Save to database with expiration
  await this.userService.update(userId, {
    verificationCode: otp,
    verificationCodeExpiry: new Date(Date.now() + 15 * 60 * 1000), // 15 min
  });

  // Send email (integrate with email service)
  await this.emailService.sendVerificationEmail(user.email, otp);

  return { message: 'OTP sent to email' };
}
```

### **Verifying OTP**

**Endpoint:** `POST /auth/verify-otp`

```typescript
async verifyOTP(email: string, code: string) {
  const user = await this.userService.findByEmail(email);

  if (!user) {
    throw new NotFoundException('User not found');
  }

  if (user.isVerified) {
    throw new BadRequestException('Account already verified');
  }

  // Check if OTP matches
  if (user.verificationCode !== code) {
    throw new BadRequestException('Invalid OTP');
  }

  // Check if expired
  if (new Date() > user.verificationCodeExpiry) {
    throw new BadRequestException('OTP expired');
  }

  // Mark as verified
  await this.userService.update(user.id, {
    isVerified: true,
    verificationCode: null,
    verificationCodeExpiry: null,
  });

  return { message: 'Account verified successfully' };
}
```

### **Resending OTP**

**Endpoint:** `POST /auth/resend-otp`

```typescript
async resendOTP(email: string) {
  const user = await this.userService.findByEmail(email);

  if (!user) {
    throw new NotFoundException('User not found');
  }

  if (user.isVerified) {
    throw new BadRequestException('Account already verified');
  }

  return this.generateOTP(user.id);
}
```

---

## 🛡️ Passport Strategies

### **JWT Strategy**

Validates JWT tokens and loads user:

**Location:** `src/auth/strategies/jwt.strategy.ts`

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userService.findOne(payload.id);

    if (!user || !user.isVerified) {
      throw new UnauthorizedException();
    }

    return user; // Available as req.user
  }
}
```

### **Local Strategy**

Validates email/password for login:

**Location:** `src/auth/strategies/local.strategy.ts`

```typescript
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string) {
    const user = await this.authService.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isVerified) {
      throw new UnauthorizedException('Please verify your account');
    }

    return user;
  }
}
```

---

## 🛡️ Auth Guards

### **JWT Guard**

Protects routes requiring authentication:

**Location:** `src/auth/guards/jwt-auth.guard.ts`

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
```

**Usage:**

```typescript
@Controller('profile')
export class ProfileController {
  @Get()
  @UseGuards(JwtAuthGuard) // Protected route
  getProfile(@User() user: User) {
    return user;
  }
}
```

### **Local Guard**

Used for login endpoint:

```typescript
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
```

**Usage:**

```typescript
@Post('login')
@UseGuards(LocalAuthGuard)
async login(@User() user: User) {
  return this.authService.login(user);
}
```

---

## 🔄 Password Reset Flow

### **Step 1: Request Reset**

**Endpoint:** `POST /auth/password-reset`

```typescript
async requestPasswordReset(email: string) {
  const user = await this.userService.findByEmail(email);

  if (!user) {
    // Don't reveal if email exists
    return { message: 'If email exists, reset link sent' };
  }

  // Generate unique token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash token before saving
  const hashedToken = await bcrypt.hash(resetToken, 10);

  // Save with expiration
  await this.userService.update(user.id, {
    passwordResetToken: hashedToken,
    passwordResetExpiry: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
  });

  // Send email with reset link
  const resetUrl = `${process.env.FRONT_URL}/reset-password?token=${resetToken}`;
  await this.emailService.sendPasswordResetEmail(user.email, resetUrl);

  return { message: 'Password reset link sent' };
}
```

### **Step 2: Verify Token**

**Endpoint:** `GET /auth/verify-reset-token/:token`

```typescript
async verifyResetToken(token: string) {
  const users = await this.userService.findUsersWithResetToken();

  for (const user of users) {
    const isValid = await bcrypt.compare(token, user.passwordResetToken);

    if (isValid && new Date() < user.passwordResetExpiry) {
      return { valid: true };
    }
  }

  throw new BadRequestException('Invalid or expired reset token');
}
```

### **Step 3: Reset Password**

**Endpoint:** `POST /auth/update-password`

```typescript
async resetPassword(token: string, newPassword: string) {
  const users = await this.userService.findUsersWithResetToken();
  let validUser = null;

  for (const user of users) {
    const isValid = await bcrypt.compare(token, user.passwordResetToken);

    if (isValid && new Date() < user.passwordResetExpiry) {
      validUser = user;
      break;
    }
  }

  if (!validUser) {
    throw new BadRequestException('Invalid or expired reset token');
  }

  // Update password (interceptor hashes it)
  await this.userService.update(validUser.id, {
    password: newPassword,
    passwordResetToken: null,
    passwordResetExpiry: null,
  });

  return { message: 'Password updated successfully' };
}
```

---

## 🔐 Security Features

### **1. Password Hashing Interceptor**

Automatically hashes passwords before saving:

```typescript
@UseInterceptors(HashPasswordInterceptor)
@Post('register')
async register(@Body() dto: RegisterDto) {
  // Password is already hashed by interceptor
  return this.authService.register(dto);
}
```

### **2. Unique Field Validation**

Prevents duplicate emails:

```typescript
@UseInterceptors(new UniqueInterceptor(['email']))
@Post('register')
async register(@Body() dto: RegisterDto) {
  return this.authService.register(dto);
}
```

### **3. Same Password Check**

Prevents using the same password:

```typescript
@UseInterceptors(SamePasswordInterceptor)
@Post('change-password')
async changePassword(@Body() dto: ChangePasswordDto) {
  // Validates oldPassword !== newPassword
  return this.authService.changePassword(dto);
}
```

### **4. Rate Limiting**

Protect against brute force:

```typescript
// Apply globally or per route
@UseGuards(ThrottlerGuard)
@Post('login')
async login(@Body() dto: LoginDto) {
  return this.authService.login(dto);
}
```

### **5. CORS Configuration**

**Location:** `src/main.ts`

```typescript
app.enableCors({
  origin: process.env.FRONT_URL || 'http://localhost:3000',
  credentials: true,
});
```

---

## 📡 API Endpoints

### **Public Endpoints**

| Method | Endpoint                          | Description               |
| ------ | --------------------------------- | ------------------------- |
| POST   | `/auth/register`                  | Register new user         |
| POST   | `/auth/login`                     | Login with email/password |
| POST   | `/auth/verify-otp`                | Verify account with OTP   |
| POST   | `/auth/resend-otp`                | Resend verification OTP   |
| POST   | `/auth/password-reset`            | Request password reset    |
| GET    | `/auth/verify-reset-token/:token` | Verify reset token        |
| POST   | `/auth/update-password`           | Reset password with token |

### **Protected Endpoints (Require JWT)**

| Method | Endpoint                | Description                  |
| ------ | ----------------------- | ---------------------------- |
| POST   | `/auth/logout`          | Logout user                  |
| POST   | `/auth/change-password` | Change password              |
| GET    | `/auth/2fa/generate`    | Generate 2FA secret          |
| POST   | `/auth/2fa/activate`    | Activate 2FA                 |
| POST   | `/auth/2fa/deactivate`  | Deactivate 2FA               |
| POST   | `/auth/2fa/verify`      | Verify 2FA code during login |
| GET    | `/auth/me`              | Get current user             |

---

## 🎓 Summary

**Key Components:**

1. **JWT Tokens** - Secure, stateless authentication
2. **bcrypt** - Industry-standard password hashing
3. **Passport.js** - Flexible authentication strategies
4. **TOTP 2FA** - Time-based one-time passwords
5. **Email OTP** - Account verification
6. **Guards** - Route protection
7. **Interceptors** - Automatic password processing
8. **Password Reset** - Secure token-based flow

**Security Best Practices:**

✅ Passwords never stored in plain text  
✅ JWT tokens with expiration  
✅ 2FA for additional security  
✅ Email verification required  
✅ Time-limited reset tokens  
✅ Rate limiting on auth endpoints  
✅ CORS protection  
✅ Validation at every step

---

## 📚 Related Documentation

- [File Upload System](./file-upload-system.md)
- [Prisma Database](./prisma.md)
- [Project Structure](./project-structure.md)
