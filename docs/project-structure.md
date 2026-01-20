# 🏗️ Project Structure & Core Modules

This document explains the essential project structure, core modules, and default files that form the foundation of every NestJS project in this template.

---

## 📋 Table of Contents

- [Project Structure](#project-structure)
- [Core Module](#core-module)
- [Common Folder](#common-folder)
- [Module Organization](#module-organization)
- [Essential Files](#essential-files)
- [Best Practices](#best-practices)

---

## 🗂️ Project Structure

```
server/
├── src/
│   ├── main.ts                    # Application entry point
│   ├── app.module.ts              # Root module
│   ├── prisma.module.ts           # Prisma global module
│   ├── prisma.service.ts          # Prisma service
│   │
│   ├── core/                      # ⭐ Core functionality
│   │   ├── core.module.ts         # Global core module
│   │   ├── filter/                # Exception filters
│   │   │   └── http-exception.filter.ts
│   │   ├── interceptor/           # Global interceptors
│   │   │   ├── logging.interceptor.ts
│   │   │   └── response.interceptor.ts
│   │   └── pipe/                  # Global pipes
│   │       └── validation.pipe.ts
│   │
│   ├── common/                    # ⭐ Shared utilities
│   │   ├── config/                # Configuration files
│   │   │   └── multer.config.ts
│   │   ├── decorator/             # Custom decorators
│   │   │   ├── user.decorator.ts
│   │   │   └── lang.decorator.ts
│   │   ├── guard/                 # Custom guards
│   │   │   └── jwt-auth.guard.ts
│   │   ├── interceptor/           # Module-level interceptors
│   │   │   ├── hash-password.interceptor.ts
│   │   │   ├── unique.interceptor.ts
│   │   │   └── same-password.interceptor.ts
│   │   └── middleware/            # Middleware
│   │       └── logger.middleware.ts
│   │
│   ├── auth/                      # Feature modules
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── dto/
│   │   ├── strategies/
│   │   └── guards/
│   │
│   ├── user/                      # Feature modules
│   ├── product/
│   ├── upload/
│   │
│   ├── shared/                    # Shared business logic
│   │   └── shared.module.ts
│   │
│   ├── generated/                 # Generated code
│   │   └── prisma/                # Prisma Client
│   │
│   ├── types/                     # TypeScript types
│   │   └── index.ts
│   │
│   └── lib/                       # Utility libraries
│       ├── enums.ts
│       ├── functions.ts
│       └── lang/                  # i18n translations
│           ├── en.json
│           ├── ar.json
│           └── ckb.json
│
├── prisma/                        # Prisma schema & migrations
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
│
├── uploads/                       # File uploads storage
│
├── docs/                          # Documentation
│
├── .env                           # Environment variables
├── .gitignore
├── nest-cli.json                  # NestJS CLI config
├── tsconfig.json                  # TypeScript config
├── package.json
└── README.md
```

---

## ⭐ Core Module

The **core module** contains **global** functionality that applies to the **entire application**.

### **Purpose**

- Register global filters, interceptors, and pipes
- Available in every module without importing
- Application-wide error handling and logging
- Response formatting

### **File: `src/core/core.module.ts`**

```typescript
import { Global, Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { HttpExceptionFilter } from './filter/http-exception.filter';
import { LoggingInterceptor } from './interceptor/logging.interceptor';
import { ResponseInterceptor } from './interceptor/response.interceptor';
import { ValidationPipe } from './pipe/validation.pipe';

@Global() // ⭐ Makes this module available globally
@Module({
  providers: [
    // Global exception filter
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    // Global logging interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    // Global response formatting
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    // Global validation pipe
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class CoreModule {}
```

### **Registering in App Module**

```typescript
// src/app.module.ts
import { CoreModule } from './core/core.module';

@Module({
  imports: [
    CoreModule, // ⭐ Import once, available everywhere
    AuthModule,
    UserModule,
    // ... other modules
  ],
})
export class AppModule {}
```

---

### **Core Components**

#### **1. HTTP Exception Filter**

**File:** `src/core/filter/http-exception.filter.ts`

Catches all HTTP exceptions and formats error responses:

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { LanguageService } from '@/language/language.service';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private languageService: LanguageService) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message: any = exceptionResponse;

    // Handle validation errors
    if (
      typeof exceptionResponse === 'object' &&
      'message' in exceptionResponse
    ) {
      message = exceptionResponse.message;
    }

    // Translate error messages
    if (Array.isArray(message)) {
      message = message.map((msg) => this.languageService.translate(msg));
    } else if (typeof message === 'string') {
      message = this.languageService.translate(message);
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
```

#### **2. Logging Interceptor**

**File:** `src/core/interceptor/logging.interceptor.ts`

Logs all requests and responses:

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const now = Date.now();

    console.log(`→ ${method} ${url}`);

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode;
        console.log(`← ${method} ${url} ${statusCode} ${Date.now() - now}ms`);
      }),
    );
  }
}
```

#### **3. Response Interceptor**

**File:** `src/core/interceptor/response.interceptor.ts`

Formats all successful responses:

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => ({
        statusCode: context.switchToHttp().getResponse().statusCode,
        message: 'Success',
        data,
      })),
    );
  }
}
```

#### **4. Validation Pipe**

**File:** `src/core/pipe/validation.pipe.ts`

Validates DTOs with i18n support:

```typescript
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { LanguageService } from '@/language/language.service';

@Injectable()
export class ValidationPipe implements PipeTransform {
  constructor(private languageService: LanguageService) {}

  async transform(value: any, { metatype }: any) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      const formattedErrors = errors.map((error) => ({
        field: error.property,
        messages: Object.values(error.constraints || {}),
      }));

      throw new BadRequestException(formattedErrors);
    }

    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
```

---

## 🛠️ Common Folder

The **common folder** contains **reusable utilities** that can be imported by feature modules.

### **Purpose**

- Shared decorators, guards, interceptors
- Module-specific utilities
- Not global - must be imported where needed

---

### **1. Decorators**

#### **User Decorator**

**File:** `src/common/decorator/user.decorator.ts`

Extracts user from JWT request:

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user; // Set by JwtStrategy
  },
);
```

**Usage:**

```typescript
@Get('me')
@UseGuards(JwtAuthGuard)
getProfile(@User() user: User) {
  return user;
}
```

#### **Language Decorator**

**File:** `src/common/decorator/lang.decorator.ts`

Extracts language from headers:

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Lang = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers['x-lang'] || 'en';
  },
);
```

**Usage:**

```typescript
@Get('products')
getProducts(@Lang() lang: string) {
  return this.productService.findAll(lang);
}
```

---

### **2. Guards**

Guards control access to routes.

#### **JWT Auth Guard**

**File:** `src/common/guard/jwt-auth.guard.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

**Usage:**

```typescript
@Controller('profile')
@UseGuards(JwtAuthGuard) // All routes protected
export class ProfileController {
  @Get()
  getProfile(@User() user: User) {
    return user;
  }
}
```

---

### **3. Interceptors**

Module-level interceptors for specific use cases.

#### **Hash Password Interceptor**

**File:** `src/common/interceptor/hash-password.interceptor.ts`

Automatically hashes passwords:

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

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

**Usage:**

```typescript
@Post('register')
@UseInterceptors(HashPasswordInterceptor)
register(@Body() dto: RegisterDto) {
  return this.authService.register(dto);
}
```

#### **Unique Field Interceptor**

**File:** `src/common/interceptor/unique.interceptor.ts`

Validates unique fields before database operation:

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma.service';

@Injectable()
export class UniqueInterceptor implements NestInterceptor {
  constructor(
    private prisma: PrismaService,
    private model: string,
    private fields: string[],
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const body = request.body;

    for (const field of this.fields) {
      if (body[field]) {
        const exists = await this.prisma[this.model].findUnique({
          where: { [field]: body[field] },
        });

        if (exists) {
          throw new ConflictException(`${field} already exists`);
        }
      }
    }

    return next.handle();
  }
}
```

**Usage:**

```typescript
@Post('register')
@UseInterceptors(new UniqueInterceptor(prisma, 'user', ['email']))
register(@Body() dto: RegisterDto) {
  return this.authService.register(dto);
}
```

---

### **4. Configuration**

#### **Multer Config**

**File:** `src/common/config/multer.config.ts`

File upload configuration:

```typescript
import { diskStorage } from 'multer';
import { extname } from 'path';

export const multerConfig = {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  },
};
```

---

## 📦 Module Organization

### **Feature Module Structure**

Each feature should follow this structure:

```
feature/
├── feature.module.ts          # Module definition
├── feature.controller.ts      # HTTP endpoints
├── feature.service.ts         # Business logic
├── dto/                       # Data Transfer Objects
│   ├── create-feature.dto.ts
│   └── update-feature.dto.ts
├── entities/                  # TypeScript entities (optional)
│   └── feature.entity.ts
└── interfaces/                # TypeScript interfaces (optional)
    └── feature.interface.ts
```

### **Feature Module Example**

```typescript
import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { PrismaModule } from '@/prisma.module';

@Module({
  imports: [PrismaModule], // Import required modules
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService], // Export if used by other modules
})
export class ProductModule {}
```

---

## 📄 Essential Files

### **1. main.ts**

Application entry point:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security
  app.use(helmet());
  app.enableCors({
    origin: process.env.FRONT_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Middleware
  app.use(cookieParser());
  app.use(compression());

  // Global prefix
  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT || 3001);
  console.log(
    `🚀 Server running on http://localhost:${process.env.PORT || 3001}`,
  );
}
bootstrap();
```

### **2. app.module.ts**

Root module:

```typescript
import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { PrismaModule } from './prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { UploadModule } from './upload/upload.module';
import { LanguageModule } from './language/language.module';

@Module({
  imports: [
    CoreModule, // Global functionality
    PrismaModule, // Database
    LanguageModule, // i18n
    AuthModule,
    UserModule,
    ProductModule,
    UploadModule,
  ],
})
export class AppModule {}
```

### **3. prisma.module.ts & prisma.service.ts**

Database service:

**prisma.module.ts:**

```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

**prisma.service.ts:**

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@/generated/prisma';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
    console.log('✅ Database connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('❌ Database disconnected');
  }
}
```

---

## ✅ Best Practices

### **1. Module Organization**

✅ **One feature = One module**  
✅ **Keep modules focused and cohesive**  
✅ **Export services that other modules need**  
✅ **Use @Global() sparingly** (Core, Prisma, Language only)

### **2. File Naming**

✅ **kebab-case.type.ts** (e.g., `user.service.ts`, `create-user.dto.ts`)  
✅ **Descriptive names** (e.g., `hash-password.interceptor.ts`)  
✅ **Group by type** (controllers/, services/, dto/)

### **3. Dependency Injection**

✅ **Inject via constructor**  
✅ **Use interfaces when possible**  
✅ **Keep constructors simple**

```typescript
// ✅ GOOD
@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
}

// ❌ BAD - logic in constructor
@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {
    this.init(); // ❌ Don't do this
  }
}
```

### **4. Error Handling**

✅ **Use built-in HTTP exceptions**  
✅ **Let global filter handle formatting**  
✅ **Provide clear error messages**

```typescript
// ✅ GOOD
throw new NotFoundException('User not found');

// ❌ BAD
throw new Error('User not found');
```

### **5. DTOs and Validation**

✅ **Always use DTOs for input**  
✅ **Validate with class-validator**  
✅ **Use transformation when needed**

```typescript
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
```

---

## 🎓 Summary

**Essential Folders:**

- **core/** - Global filters, interceptors, pipes
- **common/** - Reusable decorators, guards, interceptors
- **[feature]/** - Feature modules (auth, user, product, etc.)

**Key Modules:**

- **CoreModule** - @Global(), provides app-wide functionality
- **PrismaModule** - @Global(), database access
- **LanguageModule** - @Global(), i18n support

**Best Practices:**

✅ Global only for truly global services  
✅ One feature = One module  
✅ Use dependency injection  
✅ Validate all inputs with DTOs  
✅ Handle errors with NestJS exceptions

---

## 📚 Related Documentation

- [Authentication System](./authentication-system.md)
- [File Upload System](./file-upload-system.md)
- [Prisma Database](./prisma.md)
