# Authentication

User registration, login, and token-based authentication system.

## Overview

The authentication system provides secure user registration and login using JWT (JSON Web Tokens). It includes both access tokens for API requests and refresh tokens for session management.

## Features

| Feature | Backend | Web | Mobile |
|---------|---------|-----|--------|
| Sign up | Done | Done | Planned |
| Sign in | Done | Done | Planned |
| Refresh token | Done | Not implemented | Planned |
| Sign out | Done | Done | Planned |

## Backend Implementation

**Location:** `backend-api/src/auth/`

### Components

- **Controller:** `auth.controller.ts`
- **Service:** `auth.service.ts`
- **DTOs:**
  - `sign-up.dto.ts` - User registration data
  - `sign-in.dto.ts` - Login credentials
  - `refresh-token.dto.ts` - Token refresh request
- **Strategies:**
  - `jwt.strategy.ts` - JWT validation strategy
- **Guards:**
  - `jwt-auth.guard.ts` - Protected route guard
  - `@Public()` decorator for public routes

### API Endpoints

#### Sign Up
```http
POST /api/v1/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

#### Sign In
```http
POST /api/v1/auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### Refresh Token
```http
POST /api/v1/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

#### Sign Out
```http
POST /api/v1/auth/signout
Authorization: Bearer <accessToken>
```

### Validation Rules

**Email:**
- Must be valid email format
- Must be unique

**Password:**
- Minimum 6 characters
- Hashed with bcrypt (10 salt rounds)

**Name:**
- Required field
- String type

### Security

- Password hashing with bcrypt
- JWT-based authentication
- Separate access and refresh tokens
- Token expiration (configurable)
- Global guard for protected routes

**TODO:**
- Add refresh token rotation
- Add password complexity requirements

## Web Implementation

**Location:** `web/src/pages/`

### Pages

- `SignupPage.tsx` - User registration form
- `LoginPage.tsx` - User login form

### Authentication State

**Location:** `web/src/lib/auth.ts`

**Features:**
- Token storage in localStorage
- User state persistence
- Auto-logout on token expiration
- Type-safe auth interfaces

### Demo Credentials (Development)

For quick testing in development mode:

- **Email:** `demo@nestconnect.dev`
- **Password:** `demopass123`

The web login page shows a "Fill demo login (dev)" button in development mode.

## Database Schema

**Table:** `User`

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Testing

**Backend Tests:** `backend-api/test/app.e2e-spec.ts`
- Sign up with valid data
- Sign up with duplicate email
- Sign in with valid/invalid credentials
- Refresh token flow
- Sign out

**Web Tests:** `web/e2e/login.spec.ts`
- Login page renders
- Form submission
- Navigation after login

Run tests: `cd backend-api && npm run test:e2e`

## Configuration

### Environment Variables

**Backend** (`.env.dev`, `.env.prod`):
```env
JWT_SECRET=your-secret-key-here
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
```

**Web** (`.env`):
```env
VITE_API_URL=http://localhost:4000/api/v1
```

## Known Limitations

1. **No email verification** - Users can sign up without verifying email
2. **No password reset** - Users cannot reset forgotten passwords
3. **No OAuth/Social login** - Only email/password authentication
4. **No 2FA** - No two-factor authentication support
5. **localStorage for tokens** - Vulnerable to XSS (consider httpOnly cookies)

## Future Enhancements

- Email verification on signup
- Password reset flow
- OAuth providers (Google, GitHub)
- Two-factor authentication (2FA)
- Session management
- Login attempt limiting
- Password complexity requirements
- Account lockout after failed attempts

## Related Documentation

- [API Documentation](../core/architecture/API.md)
- [Database Schema](../core/architecture/DATABASE_SCHEMA.md)
- [Security Best Practices](../core/security/README.md)
