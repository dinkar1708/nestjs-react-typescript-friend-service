# Documentation

Complete documentation for NestConnect - A social networking and real-time chat application.

---

## Structure

```
docs/
├── README.md                    # This file
│
├── core/                        # Shared technical docs
│   ├── architecture/            # System design
│   ├── security/                # Security guidelines
│   ├── deployment/              # Deployment guides
│   └── configuration/           # Environment config
│
├── interfaces/                  # How to use (each interface)
│   ├── web/                     # Web interface (React + Vite)
│   └── mobile/                  # Mobile app (Flutter - planned)
│
├── features/                    # What it does
├── development/                 # For developers
└── getting-started/             # Quick start
```

---

## Quick Navigation

### Getting Started

**New user?** Start here:
1. [getting-started/QUICKSTART.md](getting-started/QUICKSTART.md) - Get running in 5 minutes
2. [getting-started/WHY.md](getting-started/WHY.md) - Why use NestConnect?
3. [Choose interface](#interfaces) - Pick web or mobile

---

### Core (Reusable Docs)

**Architecture & Design:**
- [core/architecture/ARCHITECTURE.md](core/architecture/ARCHITECTURE.md) - System design overview
- [core/architecture/DATABASE_SCHEMA.md](core/architecture/DATABASE_SCHEMA.md) - Prisma schema & relationships
- [core/architecture/API.md](core/architecture/API.md) - REST API specification

**Security:**
- [core/security/README.md](core/security/README.md) - Security overview
- [core/security/AUTHENTICATION.md](core/security/AUTHENTICATION.md) - JWT auth flow
- [core/security/BEST_PRACTICES.md](core/security/BEST_PRACTICES.md) - Security checklist

**Deployment:**
- [core/deployment/DOCKER.md](core/deployment/DOCKER.md) - Docker & docker-compose
- [core/deployment/PRODUCTION.md](core/deployment/PRODUCTION.md) - Production deployment

**Configuration:**
- [core/configuration/ENVIRONMENT.md](core/configuration/ENVIRONMENT.md) - Environment variables

---

### Interfaces (How to Use)

Pick how you want to use NestConnect:

**[Web](interfaces/web/)** - Browser interface (React + Vite)
- For: End users, demos
- Setup: 5 minutes
- Use: Sign up, add friends, chat in browser

**[Mobile](interfaces/mobile/)** - Cross-platform app (Flutter)
- For: Mobile users
- Status: Planned
- Use: Native iOS/Android experience

---

### Features

What the product does:
- [Authentication](features/01-authentication.md) - Sign up, sign in, JWT tokens
- [User Management](features/02-user-management.md) - Browse users, profiles
- [Friend System](features/03-friend-system.md) - Requests, accept/reject, friend list
- [Real-time Chat](features/04-real-time-chat.md) - WebSocket messaging, conversations
- [WebRTC Demo](features/05-webrtc-demo.md) - Learning example with raw WebRTC APIs

---

### Development

For developers building features:
- [development/LOCAL_DEVELOPMENT.md](development/LOCAL_DEVELOPMENT.md) - Dev setup & workflow
- [development/TESTING.md](development/TESTING.md) - Unit & E2E tests
- [development/CODE_STANDARDS.md](development/CODE_STANDARDS.md) - Style guide & best practices

---

## By Role

### End User
1. Pick interface: [Web](interfaces/web/) or [Mobile](interfaces/mobile/) (planned)
2. Sign up for account
3. Add friends and start chatting

### Developer
1. [getting-started/QUICKSTART.md](getting-started/QUICKSTART.md) - Setup
2. [development/LOCAL_DEVELOPMENT.md](development/LOCAL_DEVELOPMENT.md) - Dev workflow
3. [core/architecture/](core/architecture/) - System design

### DevOps
1. [core/deployment/](core/deployment/) - Deployment guides
2. [core/security/](core/security/) - Security setup
3. [core/configuration/](core/configuration/) - Configuration

---

## Key Concept: Core vs Interfaces

**Core docs** are reusable across ALL interfaces:
- Security → used by web, mobile
- Deployment → used by all interfaces
- Configuration → used by all interfaces

**Interface docs** are specific to each platform:
- Web → React + Vite specific setup
- Mobile → Flutter specific setup (planned)

**This avoids duplication.** Each interface references core docs.

---

## File Count

| Category | Count | Location |
|---|---|---|
| Core (shared) | 7 | `/docs/core/**/*.md` |
| Interfaces | 2 | `/docs/interfaces/**/*.md` |
| Features | 5 | `/docs/features/*.md` |
| Development | 3 | `/docs/development/*.md` |
| Getting Started | 2 | `/docs/getting-started/*.md` |
| **Total** | **19 files** | All organized |

---

## Contributing

Found an issue or want to improve docs?
1. Open GitHub issue with label `documentation`
2. Or submit a PR

**Questions?** See [main README](../README.md) or [REFERENCES.md](REFERENCES.md)
