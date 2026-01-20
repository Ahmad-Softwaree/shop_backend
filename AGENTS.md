# 🤖 Agent Instructions & Coding Standards

This file contains **strict coding standards and architecture patterns** for the **Shop Backend API** project. All AI agents and developers **MUST** follow these rules to maintain consistency.

## 📚 About Shop Backend

**Shop Backend** is a robust NestJS REST API that powers the Shop e-commerce platform. It provides secure authentication, user management, multilingual item listings, and order processing capabilities.

### Core Features:

- 🔐 **Authentication System** - JWT-based auth with 2FA (TOTP) support using otplib
- 👤 **User Management** - Complete user CRUD with profile updates, password management
- 📦 **Item Marketplace** - Multilingual product listings (EN/AR/CKB) with images and pricing
- 🛒 **Order System** - User purchase tracking and order history
- 🌍 **Multi-language Support** - Built-in i18n with English, Arabic, and Kurdish
- 🔒 **Security Features** - Password hashing interceptor, helmet, CORS, rate limiting
- 📊 **Database** - PostgreSQL with Prisma ORM for type-safe queries
- 🎯 **Custom Interceptors** - Password hashing, unique fields validation, same password checking
- 🌐 **Global Exception Handling** - Structured error responses with validation support

### Tech Stack:

- **Framework**: NestJS 10.x (TypeScript)
- **Database**: PostgreSQL with Prisma ORM 7.x
- **Authentication**: JWT (nestjs/jwt) + bcrypt for password hashing
- **2FA**: otplib for TOTP-based two-factor authentication
- **Validation**: class-validator + class-transformer
- **Security**: helmet, compression, cookie-parser, CORS
- **Runtime**: Bun (package manager and runtime)

---

## 🚨 CRITICAL: Project Configuration

### 📦 Package Manager

- **ALWAYS use `bun`** - This is the ONLY package manager for this project
- **NEVER use `npm`, `yarn`, or `pnpm`**
- All installation commands MUST use `bun add` or `bun install`
- Run dev server with: `bun run start:dev`

### 🔐 Environment Variables

- **ALWAYS use `.env`** - This is the ONLY environment file
- **NEVER create `.env.local`, `.env.example`, `.env.development`, or any other .env variants**
- All environment variables go in the single `.env` file
- The `.env` file is gitignored and safe for local development

### 🗄️ Database & Prisma

- **See**: [docs/prisma.md](docs/prisma.md) for comprehensive Prisma guidelines
- **Database**: PostgreSQL only
- **ORM**: Prisma Client (generated in `src/generated/prisma`)
- **Migrations**: Always use descriptive names: `npx prisma migrate dev --name add-feature`
- **Seeding**: Run `bun run db:seed` to populate database with sample data

---

## 🚨 CRITICAL: Library Enforcement

**ONLY** use the libraries and tools specified in this document. **DO NOT** introduce any other libraries without explicit approval.

### ✅ APPROVED LIBRARIES & TOOLS

#### **Framework & Core**

- **NestJS** - Backend framework (@nestjs/common, @nestjs/core, @nestjs/platform-express)
- **TypeScript** - All code must be TypeScript
- **Bun** - Package manager and runtime (ONLY package manager allowed)

#### **Database & ORM**

- **Prisma** - Database ORM (@prisma/client)
- **PostgreSQL** - Database (via pg adapter)
- **See**: [docs/prisma.md](docs/prisma.md) for detailed Prisma guidelines

#### **Authentication & Security**

- **JWT** - @nestjs/jwt for token management
- **Passport** - @nestjs/passport + passport-jwt for JWT strategy
- **bcrypt** - Password hashing (NOT bcryptjs)
- **otplib** - TOTP-based two-factor authentication
- **helmet** - Security headers
- **cookie-parser** - Cookie handling
- **See**: [docs/authentication-system.md](docs/authentication-system.md) for complete auth architecture

#### **Validation & Transformation**

- **class-validator** - DTO validation decorators
- **class-transformer** - Object transformation
- **Custom ValidationPipe** - Global validation with i18n support

#### **Internationalization**

- **Custom LanguageService** - Built-in i18n system (EN/AR/CKB)
- **Language files**: `lib/lang/*.json`

#### **Utilities**

- **compression** - Response compression
- **nestjs-cls** - Continuation-local storage for request context
- **dayjs** or **date-fns** - Date manipulation

#### **Development**

- **@nestjs/cli** - NestJS CLI tools
- **ts-node** - TypeScript execution
- **prettier** - Code formatting
- **eslint** - Linting

### ❌ FORBIDDEN LIBRARIES

**DO NOT USE:**

- ❌ Other ORMs: TypeORM, Sequelize, Mongoose (use Prisma only)
- ❌ Other validation: Yup, Joi, Zod (use class-validator only)
- ❌ Other password hashing: bcryptjs, argon2 (use bcrypt only)
- ❌ Express-specific middleware (use NestJS interceptors/guards)
- ❌ GraphQL (REST API only unless approved)

Before adding ANY new library:

1. Check if it's in the APPROVED list
2. Check if existing NestJS/approved libraries can solve the problem
3. If not listed, **ASK FOR PERMISSION** - do not proceed

---

## 📖 Documentation Reference

### Architecture & Setup

- **[docs/project-structure.md](docs/project-structure.md)** - CoreModule setup, common folder organization, essential project files
- **[docs/authentication-system.md](docs/authentication-system.md)** - JWT tokens, Passport strategies, 2FA/OTP, password reset
- **[docs/prisma.md](docs/prisma.md)** - Database patterns, migrations, type-safe queries

### Feature Implementation

- **[docs/file-upload-system.md](docs/file-upload-system.md)** - Complete file upload with Multer, validation, type safety
- **[docs/file-upload-quick-reference.md](docs/file-upload-quick-reference.md)** - Quick upload reference
- **[docs/file-upload-implementation-summary.md](docs/file-upload-implementation-summary.md)** - Upload summary

**When to Read Documentation:**

- Setting up new project → Read `project-structure.md`
- Adding authentication → Read `authentication-system.md`
- Working with database → Read `prisma.md`
- Implementing file uploads → Read `file-upload-system.md`

---

## 📚 Architecture Guidelines

### 1️⃣ Module Organization

**See**: [docs/project-structure.md](docs/project-structure.md) for core module patterns

**Key Rules:**

- ✅ Each feature has its own module (e.g., `auth/`, `user/`, `profile/`)
- ✅ Modules must have: controller, service, DTOs, module file
- ✅ Use `common/` for shared utilities (filters, interceptors, pipes, guards)
- ✅ Use `core/` for global setup (filters, pipes, interceptors registered in CoreModule)
- ❌ NO business logic in controllers - keep them thin
- ❌ NO circular dependencies between modules

**Folder Structure:**

```
src/
├── core/              # Global configuration (CoreModule)
│   ├── core.module.ts
│   ├── filters/       # Global exception filters
│   ├── interceptors/  # Global interceptors
│   └── pipes/         # Global validation pipes
├── common/            # Shared utilities
│   ├── decorators/    # Custom decorators
│   ├── guards/        # Auth guards
│   ├── interceptors/  # Feature interceptors
│   └── pipes/         # Custom pipes
├── auth/              # Authentication module
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   ├── strategies/    # Passport JWT strategy
│   └── dto/
├── user/              # User management
├── profile/           # Profile updates
├── common/            # Shared utilities
│   ├── filters/       # Exception filters
│   ├── interceptors/  # Custom interceptors
│   ├── pipes/         # Validation pipes
│   ├── guards/        # Auth guards
│   └── dto/           # Shared DTOs
├── core/              # Core configuration
├── decorators/        # Custom decorators
├── language/          # i18n service
├── types/             # TypeScript types
└── generated/         # Prisma generated client
```

### 2️⃣ DTOs & Validation

**See:** [docs/prisma.md](docs/prisma.md) for database patterns

**Key Rules:**

- ✅ Use `class-validator` decorators for all DTOs
- ✅ Use `PickType`, `OmitType`, `PartialType` from `@nestjs/mapped-types`
- ✅ Extend `GlobalDto` for common fields (name, email, password, etc.)
- ✅ Validation messages MUST use i18n keys (e.g., `validation.auth.email.isNotEmpty`)
- ❌ NO plain objects as DTOs - always use classes

**Example:**

```typescript
import { PickType } from '@nestjs/mapped-types';
import { GlobalDto } from 'src/common/dto/global.dto';

export class RegisterDto extends PickType(GlobalDto, [
  'name',
  'username',
  'email',
  'phone',
  'password',
]) {
  @IsString({ message: 'validation.auth.confirmPassword.isString' })
  @IsNotEmpty({ message: 'validation.auth.confirmPassword.isNotEmpty' })
  confirmPassword: string;
}
```

### 3️⃣ Services & Business Logic

**Key Rules:**

- ✅ All business logic goes in services
- ✅ Services are injectable and testable
- ✅ Use `PrismaService` for database operations
- ✅ Use `LanguageService` for error messages
- ✅ Use `ClsService` for request-scoped data (userId, etc.)
- ❌ NO direct Prisma calls in controllers
- ❌ NO hardcoded error messages - use i18n

**Example:**

```typescript
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private languageService: LanguageService,
    private clsService: ClsService,
  ) {}

  async getProfile(): Promise<User> {
    const userId = this.clsService.get('userId');
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      throw new NotFoundException(
        this.languageService.getText().controller.auth.errors.userNotFound,
      );
    }

    return user;
  }
}
```

### 4️⃣ Controllers & Routes

**Key Rules:**

- ✅ Controllers are thin - they delegate to services
- ✅ Use proper HTTP decorators (`@Get()`, `@Post()`, etc.)
- ✅ Use `@UseGuards(AuthGuard)` for protected routes
- ✅ Use `@Public()` decorator for public routes
- ✅ Use interceptors for cross-cutting concerns
- ❌ NO business logic in controllers
- ❌ NO direct database calls

**Example:**

```typescript
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  @UseInterceptors(EmptyBodyInterceptor, PasswordHashingInterceptor)
  async register(@Body() dto: RegisterDto): Promise<MessageResponse> {
    return this.authService.register(dto);
  }

  @UseGuards(AuthGuard)
  @Get('user')
  async getProfile(): Promise<User> {
    return this.authService.getProfile();
  }
}
```

### 5️⃣ Interceptors & Guards

**See**: [docs/authentication-system.md](docs/authentication-system.md) for JWT guard details

**Key Interceptors:**

- `EmptyBodyInterceptor` - Validates POST/PUT have non-empty bodies
- `PasswordHashingInterceptor` - Auto-hashes password fields before service layer
- `ResponseLoggerInterceptor` - Logs all responses globally

**Key Guards:**

- `JwtAuthGuard` (extends `AuthGuard('jwt')`) - Validates JWT token via Passport
- `ClsMiddleware` - Stores userId in continuation-local storage (CLS)
- Use `@Public()` decorator to bypass authentication

**Authentication Flow:**

1. Request → JwtAuthGuard validates token
2. JWT Strategy (`auth/strategies/jwt.strategy.ts`) verifies token and extracts payload
3. ClsMiddleware stores `userId` in request context
4. Controller/Service accesses `userId` via `ClsService`

**Usage:**

```typescript
// Password hashing
@UseInterceptors(PasswordHashingInterceptor)
async register(@Body() dto: RegisterDto) { }

// Protected route
@UseGuards(JwtAuthGuard)
async getProfile() { }

// Public route (bypasses JwtAuthGuard)
@Public()
async login(@Body() dto: LoginDto) { }

// Access userId in service
constructor(private clsService: ClsService) {}

async getProfile() {
  const userId = this.clsService.get('userId');
  // Use userId for database queries
}
```

### 6️⃣ Error Handling

**Key Rules:**

- ✅ Throw proper NestJS exceptions (`BadRequestException`, `NotFoundException`, etc.)
- ✅ Use `LanguageService` for all error messages
- ✅ Global exception filters handle formatting
- ❌ NO hardcoded error strings
- ❌ NO generic Error throws

**Example:**

```typescript
if (!user) {
  throw new NotFoundException(
    this.languageService.getText().controller.auth.errors.userNotFound,
  );
}

if (password !== confirmPassword) {
  throw new BadRequestException(
    this.languageService.getText().controller.auth.errors.passwordMismatch,
  );
}
```

---

## ✅ Pre-Flight Checklist

Before writing ANY code:

### Libraries

- [ ] Am I using ONLY approved libraries?
- [ ] Do I need to install with `bun add <package>`?
- [ ] Am I using Prisma for database operations?

### Module Structure

- [ ] Is this feature in its own module folder?
- [ ] Does the module have controller, service, DTOs?
- [ ] Did I register the module in `AppModule`?
- [ ] Am I avoiding circular dependencies?

### DTOs & Validation

- [ ] Did I create DTOs with class-validator decorators?
- [ ] Are validation messages using i18n keys?
- [ ] Did I extend `GlobalDto` for common fields?
- [ ] Did I use `PickType`/`OmitType` for composition?

### Database & Prisma

- [ ] See [docs/prisma.md](docs/prisma.md) for Prisma best practices
- [ ] Did I create/update Prisma schema if needed?
- [ ] Did I run migration with descriptive name?
- [ ] Am I using `PrismaService` for all queries?
- [ ] Did I select only needed fields?

### Authentication & Security

- [ ] See [docs/authentication-system.md](docs/authentication-system.md) for auth patterns
- [ ] Did I use `@UseGuards(JwtAuthGuard)` for protected routes?
- [ ] Did I use `@Public()` decorator for public routes?
- [ ] Did I use `PasswordHashingInterceptor` for password fields?
- [ ] Did I get userId from `ClsService` not request?
- [ ] Am I handling JWT tokens correctly?
- [ ] Did I implement 2FA/OTP if required?

### Interceptors & Guards

- [ ] Did I use `EmptyBodyInterceptor` for POST/PUT?
- [ ] Did I use `PasswordHashingInterceptor` for password hashing?
- [ ] Am I using custom guards from `common/guards/`?

### Error Handling

- [ ] Am I using `LanguageService` for error messages?
- [ ] Am I throwing proper NestJS exceptions?
- [ ] Are my responses using `MessageResponse` type?

### Code Quality

- [ ] All files are TypeScript (`.ts`)?
- [ ] All controllers are decorated with `@Controller()`?
- [ ] All services are decorated with `@Injectable()`?
- [ ] Am I following NestJS naming conventions?

---

## 🎯 Quick Reference

| Need             | Use                          | Example                                          | Reference                       |
| ---------------- | ---------------------------- | ------------------------------------------------ | ------------------------------- |
| Database query   | `PrismaService`              | `this.prisma.user.findUnique(...)`               | [prisma.md](docs/prisma.md)     |
| Validation       | `class-validator`            | `@IsEmail()`, `@IsNotEmpty()`                    | -                               |
| Password hashing | `PasswordHashingInterceptor` | `@UseInterceptors(PasswordHashingInterceptor)`   | [auth-system.md][auth]          |
| Protected route  | `JwtAuthGuard`               | `@UseGuards(JwtAuthGuard)`                       | [auth-system.md][auth]          |
| Public route     | `@Public()` decorator        | `@Public()` above controller method              | [auth-system.md][auth]          |
| JWT Strategy     | Passport JWT                 | `auth/strategies/jwt.strategy.ts`                | [auth-system.md][auth]          |
| 2FA/OTP          | otplib                       | `authenticator.generate(secret)`                 | [auth-system.md][auth]          |
| File Upload      | Multer + Custom Pipe         | `@UseInterceptors(FileInterceptor('file'))`      | [file-upload-system.md][upload] |
| Error messages   | `LanguageService`            | `this.languageService.getText().controller.auth` | -                               |
| Request user ID  | `ClsService`                 | `this.clsService.get('userId')`                  | [auth-system.md][auth]          |
| Response type    | `MessageResponse`            | `Promise<MessageResponse>`                       | -                               |
| DTO composition  | `PickType`, `OmitType`       | `extends PickType(GlobalDto, ['email'])`         | -                               |
| Migration        | Prisma CLI                   | `npx prisma migrate dev --name add-feature`      | [prisma.md](docs/prisma.md)     |
| Seed database    | Bun script                   | `bun run db:seed`                                | [prisma.md](docs/prisma.md)     |
| Start dev server | Bun                          | `bun run start:dev`                              | -                               |

[auth]: docs/authentication-system.md
[upload]: docs/file-upload-system.md

---

## 📖 Documentation

### Backend Architecture

- **[Project Structure](docs/project-structure.md)** - CoreModule, common folder, essential setup
- **[Authentication System](docs/authentication-system.md)** - JWT, Passport, 2FA/OTP, password flows
- **[Prisma Guidelines](docs/prisma.md)** - ORM patterns, migrations, queries, best practices
- **[File Upload System](docs/file-upload-system.md)** - Complete upload implementation with Multer
- **[File Upload Quick Reference](docs/file-upload-quick-reference.md)** - Quick upload guide
- **[File Upload Summary](docs/file-upload-implementation-summary.md)** - Upload summary

### Key Concepts

1. **Module Pattern** - Each feature (auth, user, profile) has its own module
2. **DTO Validation** - All inputs validated with class-validator decorators
3. **Interceptors** - Password hashing, response logging, empty body checking
4. **Guards** - JWT authentication via AuthGuard
5. **Exception Filters** - Global error handling with i18n support
6. **i18n System** - LanguageService with EN/AR/CKB language files
7. **Database** - PostgreSQL + Prisma for type-safe queries
8. **Security** - helmet, CORS, compression, cookie-parser

### Common Patterns

**Creating a new endpoint:**

1. Define DTO in `dto/` with validation decorators
2. Create service method with business logic
3. Add controller endpoint with proper decorators
4. Use interceptors for cross-cutting concerns
5. Add i18n messages to language files

**Database operations:**

1. See [docs/prisma.md](docs/prisma.md) for detailed patterns
2. Always select only needed fields
3. Use transactions for multi-step operations
4. Handle Prisma errors properly

**When in doubt:**

1. Check existing code patterns in similar modules
2. Refer to [docs/prisma.md](docs/prisma.md) for database questions
3. Ask for clarification - do NOT improvise

**Remember:** Consistency is key to maintainability. Follow NestJS patterns, use Prisma best practices, and keep services focused.
