# Architecture Overview

Comprehensive system design, tech stack, module structure, and data flow for NestConnect.

---

## Table of Contents

- [System Overview](#system-overview)
- [Tech Stack](#tech-stack)
- [Architecture Patterns](#architecture-patterns)
- [Module Structure](#module-structure)
- [Data Flow](#data-flow)
- [Real-time Communication](#real-time-communication)
- [Authentication & Authorization](#authentication--authorization)
- [Directory Structure](#directory-structure)

---

## System Overview

NestConnect is a **full-stack social networking and real-time chat application** built with enterprise-grade technologies. The system follows a **client-server architecture** with clear separation between backend API, web frontend, and planned mobile applications.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                             │
├──────────────────┬──────────────────┬──────────────────────────┤
│  Web (React)     │  Mobile (Flutter)│  External Clients        │
│  Port: 5173      │  (Planned)       │  (API Consumers)         │
└────────┬─────────┴────────┬─────────┴──────────┬───────────────┘
         │                  │                    │
         │ HTTP/WebSocket   │ HTTP/WebSocket     │ HTTP
         │                  │                    │
         ▼                  ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API Gateway Layer                            │
│  ┌───────────────────────────────────────────────────┐         │
│  │  NestJS Application (Port 4000)                   │         │
│  │  - CORS enabled                                    │         │
│  │  - Global validation pipe                          │         │
│  │  - Global exception filter                         │         │
│  │  - JWT authentication guard                        │         │
│  └───────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
         │                                              │
         │ REST API                                     │ WebSocket
         │ /api/v1/*                                    │ /chat
         │                                              │
         ▼                                              ▼
┌──────────────────────────────────┐  ┌──────────────────────────┐
│      Business Logic Layer        │  │   Real-time Layer        │
│  ┌────────────────────────────┐  │  │  ┌────────────────────┐  │
│  │ Auth Module                │  │  │  │ Chat Gateway       │  │
│  │ - SignUp/SignIn            │  │  │  │ - Socket.io        │  │
│  │ - JWT token generation     │  │  │  │ - User connections │  │
│  │ - Refresh token flow       │  │  │  │ - Message routing  │  │
│  └────────────────────────────┘  │  │  └────────────────────┘  │
│  ┌────────────────────────────┐  │  │                          │
│  │ Users Module               │  │  │                          │
│  │ - User browsing            │  │  │                          │
│  │ - User profiles            │  │  │                          │
│  │ - Search functionality     │  │  │                          │
│  └────────────────────────────┘  │  │                          │
│  ┌────────────────────────────┐  │  │                          │
│  │ Friends Module             │  │  │                          │
│  │ - Friend requests          │  │  │                          │
│  │ - Accept/reject requests   │  │  │                          │
│  │ - Friend list management   │  │  │                          │
│  └────────────────────────────┘  │  │                          │
│  ┌────────────────────────────┐  │  │                          │
│  │ Chat Module                │◄─┼──┤                          │
│  │ - Message persistence      │  │  │                          │
│  │ - Conversation retrieval   │  │  │                          │
│  │ - Friend verification      │  │  │                          │
│  └────────────────────────────┘  │  │                          │
└──────────────┬───────────────────┘  └──────────────────────────┘
               │
               │ Prisma ORM
               │
               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Data Layer                                  │
│  ┌───────────────────────────────────────────────────┐         │
│  │  PostgreSQL Database                              │         │
│  │  - Users table                                     │         │
│  │  - FriendRequests table                            │         │
│  │  - Friendships table                               │         │
│  │  - Messages table                                  │         │
│  │  - Indexes on foreign keys and queries             │         │
│  └───────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Backend API

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Runtime** | Node.js | 20+ | JavaScript runtime |
| **Framework** | NestJS | 11.x | Enterprise application framework |
| **Language** | TypeScript | 5.x | Type-safe development |
| **Database** | PostgreSQL | 15+ | Relational data storage |
| **ORM** | Prisma | 5.x | Type-safe database client |
| **Authentication** | JWT + Passport | - | Stateless authentication |
| **Password Hashing** | bcrypt | - | Secure password storage |
| **Real-time** | Socket.io | - | WebSocket communication |
| **Validation** | class-validator | - | DTO validation |
| **API Docs** | Swagger/OpenAPI | - | Interactive API documentation |
| **Testing** | Jest + Supertest | - | Unit and E2E testing |

### Web Frontend

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | React | 19.x | UI library |
| **Language** | TypeScript | 5.x | Type-safe development |
| **Build Tool** | Vite | 7.x | Fast development server |
| **Linting** | ESLint | - | Code quality |

### Mobile (Planned)

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Flutter | Cross-platform mobile apps |
| **Language** | Dart | Flutter development |

### DevOps

| Tool | Purpose |
|------|---------|
| Docker | Containerization |
| docker-compose | Local development orchestration |
| Git | Version control |
| npm | Package management |

---

## Architecture Patterns

### 1. Modular Monolith

NestConnect follows a **modular monolith** architecture where the application is organized into feature modules that are loosely coupled but deployed together.

**Benefits:**
- Clear separation of concerns
- Easy to test individual modules
- Simple deployment (single container)
- Can be split into microservices if needed

**Module Isolation:**
- Each module has its own controller, service, and DTOs
- Shared resources (Prisma, guards, filters) in common module
- Global module for database access (PrismaModule)

### 2. Layered Architecture

```
┌─────────────────────────────────────┐
│  Presentation Layer (Controllers)   │  ← HTTP/WebSocket requests
├─────────────────────────────────────┤
│  Business Logic Layer (Services)    │  ← Core business rules
├─────────────────────────────────────┤
│  Data Access Layer (Prisma)         │  ← Database operations
├─────────────────────────────────────┤
│  Database (PostgreSQL)               │  ← Data persistence
└─────────────────────────────────────┘
```

**Responsibilities:**

**Controllers** (Thin):
- Request validation (via DTOs + ValidationPipe)
- Route definition
- Response formatting
- Delegation to services

**Services** (Fat):
- Business logic
- Data validation
- Transaction management
- Error handling

**Prisma Service**:
- Database connection management
- Query execution
- Transaction support

### 3. Dependency Injection

NestJS uses **dependency injection** for loose coupling and testability:

```typescript
@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,      // Injected
    private friendsService: FriendsService  // Injected
  ) {}
}
```

**Benefits:**
- Easy to mock dependencies in tests
- Clear dependency graph
- Automatic lifecycle management

### 4. Guard-based Authentication

Global JWT authentication with opt-out for public routes:

```typescript
// Global guard in app.module.ts
providers: [
  {
    provide: APP_GUARD,
    useClass: JwtAuthGuard,
  },
]

// Opt-out for public routes
@Public()
@Post('signup')
```

---

## Module Structure

### Core Modules

#### 1. AuthModule

**Responsibility:** User authentication and JWT token management

**Endpoints:**
- `POST /api/v1/auth/signup` - Register new user
- `POST /api/v1/auth/signin` - Login with credentials
- `POST /api/v1/auth/refresh-token` - Refresh access token

**Key Components:**
- `AuthController` - HTTP endpoints
- `AuthService` - Token generation, password hashing
- `JwtStrategy` - Passport strategy for JWT validation
- DTOs: `SignUpDto`, `SignInDto`, `RefreshTokenDto`, `AuthResponseDto`

**Dependencies:**
- PrismaService (user lookup)
- JwtService (token generation/verification)
- bcrypt (password hashing)

#### 2. UsersModule

**Responsibility:** User management and browsing

**Endpoints:**
- `GET /api/v1/users` - Browse all users (excluding self)
- `GET /api/v1/users/:id` - Get user by ID

**Key Components:**
- `UsersController` - HTTP endpoints
- `UsersService` - User queries, search
- DTOs: `UserResponseDto`

**Dependencies:**
- PrismaService (user queries)

#### 3. FriendsModule

**Responsibility:** Friend request and friendship management

**Endpoints:**
- `POST /api/v1/friends/request` - Send friend request
- `POST /api/v1/friends/request/:id/accept` - Accept request
- `POST /api/v1/friends/request/:id/reject` - Reject request
- `GET /api/v1/friends` - Get friend list
- `GET /api/v1/friends/requests/received` - Pending received requests
- `GET /api/v1/friends/requests/sent` - Pending sent requests
- `DELETE /api/v1/friends/:friendId` - Remove friend

**Key Components:**
- `FriendsController` - HTTP endpoints
- `FriendsService` - Friend request logic, friendship creation
- DTOs: `SendRequestDto`

**Dependencies:**
- PrismaService (friend request/friendship queries)

**Business Logic:**
- Bidirectional friend requests (mutual acceptance creates friendship)
- Prevent duplicate requests
- Prevent self-friending
- Cascade delete on friendship removal

#### 4. ChatModule

**Responsibility:** Real-time and persistent messaging

**HTTP Endpoints:**
- `POST /api/v1/chat/messages` - Send message (REST fallback)
- `GET /api/v1/chat/conversation/:userId` - Get conversation history

**WebSocket Events:**
- `message` (client → server) - Send real-time message
- `message` (server → client) - Receive real-time message

**Key Components:**
- `ChatController` - HTTP endpoints
- `ChatService` - Message persistence, conversation retrieval
- `ChatGateway` - WebSocket gateway (Socket.io)
- DTOs: `SendMessageDto`, `MessageResponseDto`

**Dependencies:**
- PrismaService (message queries)
- FriendsService (verify friendship before allowing chat)
- JwtService (WebSocket authentication)

**Real-time Flow:**
1. Client connects to WebSocket with JWT token
2. Gateway validates token, stores user-socket mapping
3. Client sends message via `message` event
4. Gateway persists message via ChatService
5. Gateway delivers message to recipient's socket (if online)

#### 5. PrismaModule

**Responsibility:** Database connection and lifecycle management

**Key Components:**
- `PrismaService` - Extends Prisma client
- Implements `OnModuleInit` (connect on startup)
- Implements `OnModuleDestroy` (graceful shutdown)

**Configuration:**
- Global module (imported once, available everywhere)
- Connection URL from environment variable

---

## Data Flow

### 1. User Registration Flow

```
User → POST /api/v1/auth/signup
  ↓
AuthController.signUp(dto)
  ↓
ValidationPipe validates SignUpDto
  ↓
AuthService.signUp(dto)
  ├─→ Check if email exists (PrismaService)
  ├─→ Hash password (bcrypt)
  ├─→ Create user (PrismaService)
  ├─→ Generate JWT access + refresh tokens
  └─→ Return { user, accessToken, refreshToken }
  ↓
Response 201 Created
```

### 2. Friend Request Flow

```
User A → POST /api/v1/friends/request { receiverId: "user-b-id" }
  ↓
JwtAuthGuard extracts userId from token
  ↓
FriendsController.sendRequest(userId, dto)
  ↓
FriendsService.sendRequest(senderId, receiverId)
  ├─→ Verify receiver exists
  ├─→ Check if already friends
  ├─→ Check if request already sent
  ├─→ Check if reverse request exists
  │   ├─→ If YES: Auto-accept both requests, create friendship
  │   └─→ If NO: Create new PENDING request
  └─→ Return { message, status, friendshipCreated? }
  ↓
Response 201 Created
```

### 3. Real-time Chat Flow

```
User A → WebSocket connect (JWT in handshake)
  ↓
ChatGateway.handleConnection(client)
  ├─→ Extract JWT from auth header
  ├─→ Verify token (JwtService)
  ├─→ Store userId → socketId mapping
  └─→ Connection accepted
  ↓
User A → Emit 'message' { receiverId: "user-b-id", content: "Hello" }
  ↓
ChatGateway.handleMessage(payload, client)
  ├─→ Get senderId from client.userId
  ├─→ Call ChatService.sendMessage(senderId, receiverId, content)
  │   ├─→ Verify users are friends (FriendsService)
  │   ├─→ Create message in database (PrismaService)
  │   └─→ Return message object
  ├─→ Look up receiverId's socketId
  ├─→ If online: server.to(socketId).emit('message', messageObj)
  └─→ Return message to sender
  ↓
User B receives message in real-time
```

### 4. Message History Retrieval Flow

```
User A → GET /api/v1/chat/conversation/user-b-id?limit=50
  ↓
JwtAuthGuard extracts userId from token
  ↓
ChatController.getConversation(userId, otherUserId, limit)
  ↓
ChatService.getConversation(userId, otherUserId, limit)
  ├─→ Verify users are friends (FriendsService)
  ├─→ Query messages where (senderId, receiverId) match either direction
  ├─→ Order by createdAt DESC
  ├─→ Limit results
  └─→ Return messages array
  ↓
Response 200 OK with messages
```

---

## Real-time Communication

### WebSocket Architecture

**Namespace:** `/chat`

**Authentication:** JWT token in handshake
```javascript
io.connect('http://localhost:4000/chat', {
  auth: { token: 'jwt-token-here' }
})
```

**Connection Lifecycle:**

1. **Connect:**
   - Client sends JWT in `auth.token` or `query.token`
   - Gateway validates token
   - Stores `userId → socketId` mapping
   - Connection accepted

2. **Message:**
   - Client emits `message` event with `{ receiverId, content }`
   - Gateway persists message
   - Gateway emits `message` to receiver's socket (if online)

3. **Disconnect:**
   - Gateway removes `userId → socketId` mapping
   - Connection closed

**Offline Handling:**
- Messages always persisted to database
- If recipient offline, message delivered on next connection via REST API

**Scalability Considerations:**
- Current: In-memory `userSockets` map (single instance only)
- Production: Use Redis adapter for multi-instance Socket.io
  ```typescript
  import { createAdapter } from '@socket.io/redis-adapter';
  const io = new Server(server, {
    adapter: createAdapter(redisClient, redisSubClient)
  });
  ```

---

## Authentication & Authorization

### JWT Token Flow

**Access Token:**
- Short-lived (default: 1 hour)
- Contains: `{ sub: userId, email }`
- Sent in `Authorization: Bearer <token>` header
- Verified by JwtAuthGuard on every request

**Refresh Token:**
- Long-lived (default: 7 days)
- Contains: `{ sub: userId, email }`
- Used to obtain new access token
- Endpoint: `POST /api/v1/auth/refresh-token`

**Token Generation:**
```typescript
const payload = { sub: user.id, email: user.email };
const accessToken = jwtService.sign(payload, { expiresIn: '1h' });
const refreshToken = jwtService.sign(payload, { expiresIn: '7d' });
```

**Token Validation:**
```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  async validate(payload: { sub: string; email: string }) {
    return { userId: payload.sub, email: payload.email };
  }
}
```

### Authorization Patterns

**Resource Ownership:**
```typescript
// Users can only modify their own data
if (userId !== currentUser.id) {
  throw new ForbiddenException();
}
```

**Relationship-based:**
```typescript
// Users can only chat with friends
const areFriends = await this.friendsService.areFriends(userId, receiverId);
if (!areFriends) {
  throw new ForbiddenException('Can only chat with friends');
}
```

---

## Directory Structure

```
backend-api/
├── src/
│   ├── auth/                   # Authentication module
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts
│   │   └── dto/
│   │       ├── sign-up.dto.ts
│   │       ├── sign-in.dto.ts
│   │       ├── refresh-token.dto.ts
│   │       └── auth-response.dto.ts
│   │
│   ├── users/                  # Users module
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.module.ts
│   │   └── dto/
│   │       └── user-response.dto.ts
│   │
│   ├── friends/                # Friends module
│   │   ├── friends.controller.ts
│   │   ├── friends.service.ts
│   │   ├── friends.module.ts
│   │   └── dto/
│   │       └── send-request.dto.ts
│   │
│   ├── chat/                   # Chat module
│   │   ├── chat.controller.ts
│   │   ├── chat.service.ts
│   │   ├── chat.gateway.ts     # WebSocket gateway
│   │   ├── chat.module.ts
│   │   └── dto/
│   │       ├── send-message.dto.ts
│   │       └── message-response.dto.ts
│   │
│   ├── prisma/                 # Database module
│   │   ├── prisma.service.ts
│   │   └── prisma.module.ts
│   │
│   ├── common/                 # Shared resources
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   └── public.decorator.ts
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   └── dto/
│   │       └── error-response.dto.ts
│   │
│   ├── config/
│   │   └── env.config.ts       # Environment validation
│   │
│   ├── app.module.ts           # Root module
│   ├── app.controller.ts       # Health endpoint
│   └── main.ts                 # Application entry point
│
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── migrations/             # Migration history
│   └── seed.ts                 # Database seeding
│
├── test/
│   └── e2e/                    # End-to-end tests
│
├── scripts/
│   └── db-setup.js             # Database initialization
│
├── .env.dev                    # Development environment
├── .env.prod                   # Production environment
├── .env.example                # Environment template
├── docker-compose.yml          # Local development
├── Dockerfile                  # Container definition
├── package.json
└── tsconfig.json
```

---

## Performance Considerations

### Database Optimization

**Indexes:**
- All foreign keys indexed (senderId, receiverId, user1Id, user2Id)
- Query-specific indexes (status, createdAt)
- Unique constraints (email, senderId+receiverId, user1Id+user2Id)

**Connection Pooling:**
- Prisma manages connection pool automatically
- Graceful shutdown via PrismaService lifecycle hooks

**Query Optimization:**
- Select only needed fields
- Use transactions for multi-step operations
- Cascade deletes defined in schema

### API Performance

**Validation:**
- Early validation via class-validator (fail fast)
- Transform and sanitize inputs automatically

**Error Handling:**
- Global exception filter catches all errors
- Consistent error response format
- No stack traces in production

**CORS:**
- Enabled for development (`app.enableCors()`)
- Configure origins for production

---

## Scalability Path

### Current Architecture (Single Instance)

**Suitable for:**
- Development
- Small to medium deployments (<1000 concurrent users)

**Limitations:**
- WebSocket connections tied to single instance
- In-memory socket map doesn't scale

### Future: Multi-Instance Deployment

**Changes needed:**
1. **Redis adapter for Socket.io** - Share WebSocket state
2. **Stateless JWT** - Already implemented
3. **Database connection pooling** - Already handled by Prisma
4. **Load balancer** - Distribute HTTP + WebSocket traffic

**Deployment options:**
- Cloud Run (GCP) - Auto-scaling containers
- Azure Container Apps - Similar to Cloud Run
- Kubernetes - Full control over scaling

---

## Security Architecture

**Layers:**
1. **Input Validation** - ValidationPipe with class-validator
2. **Authentication** - JWT tokens, bcrypt password hashing
3. **Authorization** - Guards, relationship checks
4. **CORS** - Restrict origins in production
5. **Error Handling** - No sensitive data in errors
6. **Database** - Prisma prevents SQL injection

See [Security Documentation](../security/README.md) for details.

---

## Testing Strategy

**Unit Tests:**
- Individual service methods
- Mock Prisma client

**E2E Tests:**
- Full request/response cycles
- Test with real database (test environment)
- Current: 17 tests (auth, users, friends, chat)

**Test Command:**
```bash
npm test              # Unit tests
npm run test:e2e      # End-to-end tests
npm run test:cov      # Coverage report
```

---

## Next Steps

- **API Specification:** See [API.md](./API.md) for complete endpoint reference
- **Database Schema:** See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for data model
- **Deployment:** See [Deployment Guide](../deployment/DOCKER.md) for Docker setup
- **Configuration:** See [Environment Guide](../configuration/ENVIRONMENT.md) for variables

---

**Last Updated:** 2026-07-28
**Version:** 1.0
