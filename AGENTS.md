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
- **bcrypt** - Password hashing (NOT bcryptjs)
- **otplib** - TOTP-based two-factor authentication
- **helmet** - Security headers
- **cookie-parser** - Cookie handling

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
- ❌ Other auth: Passport.js (use @nestjs/jwt directly)
- ❌ Express-specific middleware (use NestJS interceptors/guards)
- ❌ Other password hashing: bcryptjs, argon2 (use bcrypt only)
- ❌ GraphQL (REST API only unless approved)

Before adding ANY new library:

1. Check if it's in the APPROVED list
2. Check if existing NestJS/approved libraries can solve the problem
3. If not listed, **ASK FOR PERMISSION** - do not proceed

---

## 📚 Architecture Guidelines

### 1️⃣ Module Organization

**Key Rules:**

- ✅ Each feature has its own module (e.g., `auth/`, `user/`, `profile/`)
- ✅ Modules must have: controller, service, DTOs, module file
- ✅ Use `common/` for shared utilities (filters, interceptors, pipes, guards)
- ❌ NO business logic in controllers - keep them thin
- ❌ NO circular dependencies between modules

**Folder Structure:**

```
src/
├── auth/              # Authentication module
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   ├── auth.guard.ts
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

**Key Interceptors:**

- `EmptyBodyInterceptor` - Validates POST/PUT have non-empty bodies
- `PasswordHashingInterceptor` - Auto-hashes password fields before service layer
- `ResponseLoggerInterceptor` - Logs all responses globally

**Key Guards:**

- `AuthGuard` - Validates JWT token and extracts userId
- Use `@Public()` decorator to bypass authentication

**Usage:**

```typescript
// Password hashing
@UseInterceptors(PasswordHashingInterceptor)
async register(@Body() dto: RegisterDto) { }

// Protected route
@UseGuards(AuthGuard)
async getProfile() { }

// Public route (bypasses AuthGuard)
@Public()
async login(@Body() dto: LoginDto) { }
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

- [ ] Did I use `@UseGuards(AuthGuard)` for protected routes?
- [ ] Did I use `@Public()` decorator for public routes?
- [ ] Did I use `PasswordHashingInterceptor` for password fields?
- [ ] Did I get userId from `ClsService` not request?

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

| Need             | Use                          | Example                                          |
| ---------------- | ---------------------------- | ------------------------------------------------ |
| Database query   | `PrismaService`              | `this.prisma.user.findUnique(...)`               |
| Validation       | `class-validator`            | `@IsEmail()`, `@IsNotEmpty()`                    |
| Password hashing | `PasswordHashingInterceptor` | `@UseInterceptors(PasswordHashingInterceptor)`   |
| Protected route  | `AuthGuard`                  | `@UseGuards(AuthGuard)`                          |
| Public route     | `@Public()` decorator        | `@Public()` above controller method              |
| Error messages   | `LanguageService`            | `this.languageService.getText().controller.auth` |
| Request user ID  | `ClsService`                 | `this.clsService.get('userId')`                  |
| Response type    | `MessageResponse`            | `Promise<MessageResponse>`                       |
| DTO composition  | `PickType`, `OmitType`       | `extends PickType(GlobalDto, ['email'])`         |
| Migration        | Prisma CLI                   | `npx prisma migrate dev --name add-feature`      |
| Seed database    | Bun script                   | `bun run db:seed`                                |
| Start dev server | Bun                          | `bun run start:dev`                              |

---

## 📖 Documentation

### Backend Architecture

- **[Prisma Guidelines](docs/prisma.md)** - Comprehensive Prisma ORM patterns, migrations, queries, and best practices

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
