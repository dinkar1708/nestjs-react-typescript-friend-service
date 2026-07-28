# Official References & Best Practices

This document lists official documentation and best practices we follow for building NestConnect.

---

## Backend Framework & Architecture

### NestJS (Core Framework)

1. **NestJS Official Documentation**
   - https://docs.nestjs.com/
   - https://docs.nestjs.com/first-steps
   - **Why:** Primary backend framework - enterprise-grade Node.js

2. **NestJS WebSockets & Socket.io**
   - https://docs.nestjs.com/websockets/gateways
   - https://socket.io/docs/v4/
   - **Why:** Real-time chat functionality

3. **NestJS Authentication (Passport + JWT)**
   - https://docs.nestjs.com/security/authentication
   - https://docs.nestjs.com/recipes/passport
   - **Why:** JWT-based auth implementation

4. **NestJS Swagger/OpenAPI**
   - https://docs.nestjs.com/openapi/introduction
   - https://swagger.io/specification/
   - **Why:** API documentation (available at `/api`)

---

## Database & ORM

### PostgreSQL & Prisma

5. **PostgreSQL Documentation**
   - https://www.postgresql.org/docs/
   - https://www.postgresql.org/docs/current/
   - **Why:** Primary relational database

6. **Prisma ORM**
   - https://www.prisma.io/docs
   - https://www.prisma.io/docs/orm/prisma-schema
   - **Why:** Type-safe database access, migrations

7. **Prisma Best Practices**
   - https://www.prisma.io/docs/orm/prisma-client/queries/crud
   - https://www.prisma.io/docs/orm/prisma-client/queries/transactions
   - **Why:** CRUD operations, transactions, relations

8. **Prisma Migrations**
   - https://www.prisma.io/docs/orm/prisma-migrate
   - **Why:** Database schema versioning

---

## TypeScript & Node.js

### Language & Runtime

9. **TypeScript Official Handbook**
   - https://www.typescriptlang.org/docs/
   - https://www.typescriptlang.org/docs/handbook/intro.html
   - **Why:** Primary language for backend and web

10. **Node.js Documentation**
    - https://nodejs.org/docs/latest/api/
    - **Why:** Backend runtime environment

11. **Node.js Best Practices**
    - https://github.com/goldbergyoni/nodebestpractices
    - **Why:** Security, error handling, code structure

---

## Authentication & Security

### JWT & Security

12. **JSON Web Tokens (JWT)**
    - https://jwt.io/introduction
    - https://datatracker.ietf.org/doc/html/rfc7519
    - **Why:** Stateless authentication tokens

13. **Passport.js**
    - https://www.passportjs.org/
    - https://www.passportjs.org/concepts/authentication/
    - **Why:** Authentication middleware (JWT strategy)

14. **bcrypt**
    - https://www.npmjs.com/package/bcrypt
    - **Why:** Password hashing (one-way encryption)

15. **OWASP Top 10**
    - https://owasp.org/www-project-top-ten/
    - **Why:** Security vulnerabilities we protect against

16. **CORS (Cross-Origin Resource Sharing)**
    - https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    - **Why:** Allowing web frontend to access API

---

## Validation & DTOs

17. **class-validator**
    - https://github.com/typestack/class-validator
    - **Why:** Request validation with decorators

18. **class-transformer**
    - https://github.com/typestack/class-transformer
    - **Why:** Transform plain objects to class instances

---

## Frontend (Web)

### React & Build Tools

19. **React Official Documentation**
    - https://react.dev/
    - https://react.dev/learn
    - **Why:** Primary web frontend framework (v19)

20. **Vite**
    - https://vite.dev/
    - https://vite.dev/guide/
    - **Why:** Fast build tool and dev server

21. **React Hooks**
    - https://react.dev/reference/react/hooks
    - **Why:** useState, useEffect, custom hooks

22. **React Router**
    - https://reactrouter.com/
    - https://reactrouter.com/en/main/start/tutorial
    - **Why:** Client-side routing

---

## Real-time Communication

### WebSockets & WebRTC

23. **Socket.IO Client**
    - https://socket.io/docs/v4/client-api/
    - **Why:** Real-time bidirectional communication

24. **WebRTC Official Docs**
    - https://webrtc.org/
    - https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API
    - **Why:** WebRTC demo (peer-to-peer video/audio)

25. **WebRTC API Reference**
    - https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection
    - https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
    - **Why:** Raw WebRTC APIs used in demo

26. **WebRTC Samples**
    - https://webrtc.github.io/samples/
    - **Why:** Reference implementations

---

## Mobile (Planned)

### Flutter

27. **Flutter Official Documentation**
    - https://flutter.dev/docs
    - https://flutter.dev/docs/get-started/install
    - **Why:** Cross-platform mobile framework (iOS + Android)

28. **Dart Language**
    - https://dart.dev/guides
    - https://dart.dev/language
    - **Why:** Flutter's programming language

29. **Flutter HTTP Package**
    - https://pub.dev/packages/http
    - **Why:** Making REST API calls from Flutter

30. **Flutter Socket.IO Client**
    - https://pub.dev/packages/socket_io_client
    - **Why:** Real-time chat on mobile (planned)

---

## Testing

### Unit & E2E Testing

31. **Jest (Backend Testing)**
    - https://jestjs.io/docs/getting-started
    - **Why:** Unit tests for NestJS

32. **Supertest (API Testing)**
    - https://github.com/ladjs/supertest
    - **Why:** E2E API tests

33. **Playwright (Web E2E)**
    - https://playwright.dev/
    - https://playwright.dev/docs/intro
    - **Why:** End-to-end tests for React app

---

## API Design

### REST Best Practices

34. **REST API Design**
    - https://restfulapi.net/
    - https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design
    - **Why:** RESTful API principles we follow

35. **OpenAPI Specification**
    - https://spec.openapis.org/oas/latest.html
    - **Why:** API documentation standard (Swagger uses this)

36. **HTTP Status Codes**
    - https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
    - https://httpstatuses.com/
    - **Why:** Correct status codes for API responses

---

## Code Quality & Linting

### TypeScript Tools

37. **ESLint**
    - https://eslint.org/docs/latest/
    - **Why:** JavaScript/TypeScript linter

38. **Prettier**
    - https://prettier.io/docs/en/
    - **Why:** Code formatter (opinionated)

39. **TypeScript ESLint**
    - https://typescript-eslint.io/
    - **Why:** TypeScript-specific linting rules

---

## Deployment & DevOps

### Containerization

40. **Docker**
    - https://docs.docker.com/
    - https://docs.docker.com/get-started/
    - **Why:** Containerizing backend API

41. **Docker Compose**
    - https://docs.docker.com/compose/
    - **Why:** Multi-container setup (DB + API)

42. **Docker Best Practices**
    - https://docs.docker.com/develop/dev-best-practices/
    - https://docs.docker.com/build/building/best-practices/
    - **Why:** Multi-stage builds, layer caching

### Environment Management

43. **dotenv (Node.js)**
    - https://www.npmjs.com/package/dotenv
    - **Why:** Loading environment variables from `.env`

---

## Git & Version Control

44. **Git Documentation**
    - https://git-scm.com/doc
    - **Why:** Version control system

45. **Conventional Commits**
    - https://www.conventionalcommits.org/
    - **Why:** Standardized commit messages

---

## Additional Resources

### NestJS Patterns

46. **NestJS Microservices**
    - https://docs.nest js.com/microservices/basics
    - **Why:** Future scalability option

47. **NestJS GraphQL**
    - https://docs.nestjs.com/graphql/quick-start
    - **Why:** Alternative to REST (future consideration)

### Frontend State Management

48. **React Context API**
    - https://react.dev/reference/react/createContext
    - **Why:** Simple state management (alternative to Redux)

### Performance

49. **Web Vitals**
    - https://web.dev/vitals/
    - **Why:** Frontend performance metrics

50. **Node.js Performance**
    - https://nodejs.org/en/docs/guides/simple-profiling
    - **Why:** Backend performance profiling

---

## How We Apply These References

### Backend Code Quality
- Follow **NestJS** modular architecture (auth, users, friends, chat)
- Use **TypeScript** strict mode with type hints
- Apply **Node.js best practices** (security, error handling)
- Validate with **class-validator** decorators

### API Design
- Follow **REST best practices** (resource-based URLs)
- Use **OpenAPI/Swagger** for documentation
- Return correct **HTTP status codes**
- Version API with `/api/v1/` prefix

### Database
- Use **Prisma** ORM for type-safe queries
- Apply **PostgreSQL** best practices (indexes, relations)
- Use **transactions** for multi-step operations
- Version schema with **Prisma Migrate**

### Authentication & Security
- Implement **JWT** with Passport.js
- Hash passwords with **bcrypt**
- Follow **OWASP Top 10** security guidelines
- Enable **CORS** for web frontend

### Frontend
- Use **React 19** with functional components
- Build with **Vite** for fast development
- Test with **Playwright** for E2E coverage
- Implement **WebRTC** for real-time features

### Testing
- **Jest** for backend unit tests
- **Supertest** for API E2E tests
- **Playwright** for web E2E tests
- Target: **80%+ coverage**

### Deployment
- **Docker** for containerization
- **docker-compose** for local development
- Environment-based configuration (`.env` files)
- Health check endpoints (`/health`)

---

## Quick Reference Card

**When adding a feature:**
1. Check **NestJS docs** for patterns
2. Check **Prisma docs** for database operations
3. Check **React docs** for frontend components
4. Check **project development docs** for local conventions

**When writing code:**
1. Use **TypeScript** strict mode
2. Add validation with **class-validator**
3. Write **tests** (Jest/Supertest/Playwright)
4. Run **ESLint** before committing

**When deploying:**
1. Follow **Docker best practices**
2. Use **environment variables** for config
3. Enable **logging** and monitoring
4. Test with **health check** endpoints

---

## Keeping This Updated

This document should be updated when:
- We adopt a new tool/framework
- We upgrade major versions (React 20, NestJS 12, etc.)
- We discover important best practices
- Official docs move to new URLs

**Maintenance:** Review quarterly or when adopting new technologies

---

## Getting Help

If you need clarification on any standard:
1. Check the official doc link above
2. See `docs/development/LOCAL_DEVELOPMENT.md` for project-specific patterns
3. Ask in GitHub issues or team discussions

---

**Note:** If a link is broken, please update this document.
