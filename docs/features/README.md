# Features

NestConnect is a social networking and chat application.

## Core Features

| Feature | Status | Documentation |
|---------|--------|---------------|
| [Authentication](./authentication.md) | Backend + Web | User registration, login, JWT tokens |
| [Users](./users.md) | Backend only | User profiles, browse users |
| [Friends](./friends.md) | Backend only | Friend requests, friend management |
| [Chat](./chat.md) | Backend only | Real-time messaging with WebSockets |
| [WebRTC Demo](./webrtc-demo.md) | Web only | Experimental WebRTC implementation |

## Implementation Status

| Feature | Backend | Web | Mobile |
|---------|---------|-----|--------|
| **Authentication** |
| Sign up | Done | Done | Planned |
| Sign in | Done | Done | Planned |
| Refresh token | Done | Not implemented | Planned |
| Sign out | Done | Done | Planned |
| **Users** |
| Browse users | Done | Not implemented | Planned |
| User profile | Done | Not implemented | Planned |
| **Friends** |
| Send friend request | Done | Not implemented | Planned |
| Accept/reject request | Done | Not implemented | Planned |
| Friend list | Done | Not implemented | Planned |
| Remove friend | Done | Not implemented | Planned |
| **Chat** |
| Send message | Done | Not implemented | Planned |
| View conversation | Done | Not implemented | Planned |
| Real-time (WebSocket) | Done | Not implemented | Planned |
| **Experiments** |
| WebRTC demo | Not implemented | Done | Planned |

## Quick Links

### Backend Features
- [Authentication API](./authentication.md#backend-implementation)
- [Users API](./users.md#backend-implementation)
- [Friends API](./friends.md#backend-implementation)
- [Chat API](./chat.md#backend-implementation)

### Frontend Features
- [Authentication UI](./authentication.md#web-implementation)
- [WebRTC Demo](./webrtc-demo.md#web-implementation)

### Database
- [Database Schema](../core/architecture/DATABASE_SCHEMA.md)
- [Prisma Setup](../getting-started/backend.md)

## Roadmap

### Phase 1: Backend Core (Complete)
- Authentication system
- User management
- Friend system
- Real-time chat with WebSockets
- API documentation (Swagger)
- E2E tests

### Phase 2: Web Frontend (In Progress)
- Authentication UI (Login/Signup) - Done
- WebRTC Demo (experimental) - Done
- User browsing - Planned
- Friend management UI - Planned
- Chat interface - Planned
- Real-time updates - Planned

### Phase 3: Mobile App (Planned)
- Flutter setup
- Authentication flow
- User interface
- Friend management
- Chat interface
- Push notifications

### Phase 4: Advanced Features (Future)
- Email verification
- Password reset
- OAuth/Social login
- Profile pictures
- Group chat
- File sharing
- Voice/Video calls
- Message encryption

## Testing

**Backend:** 15 E2E tests, limited unit tests
```bash
cd backend-api && npm run test:e2e
```

**Frontend:** 3 Playwright E2E tests, no unit tests yet
```bash
cd web && npm run test:e2e
```

## Architecture

All features follow a consistent architecture:

**Backend:**
```
feature/
├── feature.controller.ts   # HTTP endpoints
├── feature.service.ts      # Business logic
├── feature.module.ts       # NestJS module
├── dto/                    # Data Transfer Objects
│   ├── create-*.dto.ts
│   └── update-*.dto.ts
└── guards/                 # Authorization (if needed)
```

**Database:**
```
prisma/
└── schema.prisma          # Data models with relations
```

**Frontend:**
```
web/src/
├── pages/                 # Page components
│   └── FeaturePage.tsx
└── lib/                   # Utilities
    ├── api.ts            # API client
    └── auth.ts           # Auth helpers
```

## Related Documentation

- [Architecture Overview](../core/architecture/ARCHITECTURE.md)
- [API Documentation](../core/architecture/API.md)
- [Database Schema](../core/architecture/DATABASE_SCHEMA.md)
- [Getting Started - Backend](../getting-started/backend.md)
- [Getting Started - Web](../interfaces/web/README.md)
- [Best Practices](../BEST_PRACTICES_COMPLIANCE.md)
