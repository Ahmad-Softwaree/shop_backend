# 🛍️ Shop Backend API

<p align="center">
  <a href="http://nestjs.com/" target="_blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">A robust NestJS REST API powering the Shop e-commerce platform with JWT authentication, 2FA, multilingual support, and Prisma ORM.</p>

## 📚 Description

Shop Backend is a production-ready NestJS API that provides:

- 🔐 **Secure Authentication** - JWT tokens with bcrypt password hashing and TOTP-based 2FA
- 👤 **User Management** - Registration, login, profile updates, password management
- 📦 **Item Marketplace** - Multilingual product listings (English, Arabic, Kurdish)
- 🛒 **Order System** - User purchase tracking and order history
- 🌍 **i18n Support** - Built-in internationalization for 3 languages
- 🗄️ **PostgreSQL + Prisma** - Type-safe database queries with migrations
- 🔒 **Security First** - Helmet, CORS, rate limiting, password interceptors
- 🎯 **Custom Interceptors** - Password hashing, unique field validation, response logging
- ⚡ **Performance** - Compression, optimized queries, connection pooling

## 🚀 Tech Stack

- **Framework**: NestJS 10.x
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma 7.x
- **Authentication**: JWT (Passport) + bcrypt + otplib (TOTP 2FA)
- **File Upload**: Multer with validation and type safety
- **Runtime**: Bun (package manager)
- **Validation**: class-validator + class-transformer
- **Security**: Helmet, CORS, rate limiting
- **Architecture**: Modular with core global setup

## 📋 Prerequisites

- **Bun** (latest version) - [Install Bun](https://bun.sh)
- **PostgreSQL** (14+)
- **Node.js** (18+ for compatibility)

## 🔧 Installation

```bash
# Install dependencies with Bun
bun install

# Generate Prisma Client
bun run prisma:generate
```

## ⚙️ Environment Setup

Create a `.env` file in the root directory:

```env
# Server
PORT=3001
FRONT_URL=http://localhost:3000

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/shop?schema=public"

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Security
PASSWORD_HASH_SALT=10

# App
NEXT_PUBLIC_APP_NAME=Shop
```

## 🗄️ Database Setup

```bash
# Run migrations
bun run prisma:migrate
# or
npx prisma migrate dev

# Seed database with sample data
bun run db:seed
```

The seed will create:

- 1 user (ahmad) with credentials in `prisma/seed.ts`
- 10 sample items with multilingual data and images

## 🏃 Running the Application

```bash
# Development mode with hot-reload
bun run start:dev

# Production mode
bun run build
bun run start:prod

# Debug mode
bun run start:debug
```

Server will be available at: `http://localhost:3001`

## 🧪 Testing

```bash
# Unit tests
bun run test

# E2E tests
bun run test:e2e

# Test coverage
bun run test:cov
```

## 📚 API Documentation

### Authentication Endpoints

- `POST /auth/register` - User registration
- `POST /auth/login` - User login (returns JWT + checks 2FA)
- `POST /auth/verify-2fa` - Verify TOTP code for 2FA login
- `POST /auth/change-password` - Change user password (protected)
- `POST /auth/password-reset` - Request password reset
- `POST /auth/update-password` - Update password with reset token
- `GET /auth/2fa/secret` - Get 2FA secret for setup (protected)
- `POST /auth/2fa/activate` - Enable 2FA (protected)
- `POST /auth/2fa/deactivate` - Disable 2FA (protected)
- `GET /auth/user` - Get current user info (protected)

### Profile Endpoints

- `PUT /users/:id` - Update user profile (protected)

### Response Format

**Success:**

```json
{
  "message": "Operation successful",
  "data": {
    /* optional response data */
  }
}
```

**Error:**

```json
{
  "statusCode": 400,
  "message": "Error message or validation array"
}
```

## 🏗️ Project Structure

```
src/
├── auth/              # Authentication module (JWT, 2FA)
├── user/              # User management
├── profile/           # Profile updates
├── common/            # Shared utilities
│   ├── dto/           # Global DTOs
│   ├── filters/       # Exception filters
│   ├── interceptors/  # Custom interceptors
│   ├── pipes/         # Validation pipes
│   └── guards/        # Auth guards
├── language/          # i18n service
├── types/             # TypeScript types
├── decorators/        # Custom decorators
└── generated/         # Prisma client

lib/
└── lang/              # i18n language files (en/ar/ckb)

prisma/
├── schema.prisma      # Database schema
├── migrations/        # Migration history
└── seed.ts            # Database seeder
```

## 🔐 Security Features

1. **Password Security**
   - Bcrypt hashing with configurable salt rounds
   - Password interceptor for automatic hashing
   - Same password validation for password changes

2. **Authentication**
   - JWT-based stateless authentication
   - Two-factor authentication (TOTP)
   - Protected routes with AuthGuard

3. **Headers & CORS**
   - Helmet for security headers
   - CORS configured for frontend origin
   - Cookie-parser for secure cookies

4. **Validation**
   - class-validator for DTO validation
   - Custom validation pipe with i18n
   - Empty body interceptor

## 📖 Documentation

For detailed guidelines and best practices:

### Core Documentation

- **[AGENTS.md](AGENTS.md)** - Comprehensive coding standards and architecture patterns
- **[docs/prisma.md](docs/prisma.md)** - Prisma ORM guidelines, migrations, and query patterns

### Feature Guides

- **[docs/authentication-system.md](docs/authentication-system.md)** - JWT, Passport strategies, 2FA/OTP, password reset flows
- **[docs/project-structure.md](docs/project-structure.md)** - CoreModule, common folder, essential project setup
- **[docs/file-upload-system.md](docs/file-upload-system.md)** - Complete file upload implementation
- **[docs/file-upload-quick-reference.md](docs/file-upload-quick-reference.md)** - Quick file upload reference
- **[docs/file-upload-implementation-summary.md](docs/file-upload-implementation-summary.md)** - File upload summary

### Quick References

Each documentation file provides:

- ✅ Architecture patterns and best practices
- ✅ Code examples and usage patterns
- ✅ Common pitfalls and solutions
- ✅ Testing strategies
- ✅ Security considerations

## 🛠️ Development Scripts

```bash
# Prisma commands
bun run prisma:generate    # Generate Prisma Client
bun run prisma:migrate     # Run migrations
bun run prisma:seed        # Seed database
bun run db:seed            # Alternative seed command

# Development
bun run start:dev          # Start with hot-reload
bun run start:debug        # Start with debugging

# Build
bun run build              # Build for production

# Linting & Formatting
bun run lint               # Run ESLint
bun run format             # Format with Prettier
```

## 🌍 Internationalization

The API supports 3 languages:

- **English (en)**
- **Arabic (ar)**
- **Kurdish/Sorani (ckb)**

Language files are in `lib/lang/*.json`. All validation messages and error responses use i18n keys.

## 🤝 Contributing

Before contributing:

1. Read [AGENTS.md](AGENTS.md) for coding standards
2. Read [docs/prisma.md](docs/prisma.md) for database patterns
3. Use `bun` for all package management (not npm/yarn)
4. Follow NestJS module pattern
5. Write tests for new features

## 📄 License

This project is [MIT licensed](LICENSE).

## 👨‍💻 Author

Built with ❤️ using NestJS, Prisma, and Bun.
