# Database Schema Documentation

Complete Prisma schema documentation with entity relationships, indexes, and ER diagram description.

---

## Table of Contents

- [Overview](#overview)
- [Entity Relationship Diagram](#entity-relationship-diagram)
- [Entities](#entities)
- [Relationships](#relationships)
- [Indexes & Constraints](#indexes--constraints)
- [Migrations](#migrations)
- [Seeding](#seeding)

---

## Overview

NestConnect uses **PostgreSQL** as the relational database with **Prisma ORM** for type-safe database access.

### Database Configuration

**Connection String Format:**
```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

**Development:**
```
postgresql://postgres:password@localhost:5432/nestconnect_dev
```

**Production:**
```
postgresql://postgres:password@db-host:5432/nestconnect_prod
```

**Environment Variable:**
```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/nestconnect_dev
```

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER (Central Entity)                           │
│  ┌──────────────────────────────────────────────────────────────┐      │
│  │ id          UUID PRIMARY KEY                                  │      │
│  │ name        VARCHAR                                            │      │
│  │ email       VARCHAR UNIQUE                                     │      │
│  │ password    VARCHAR (bcrypt hashed)                            │      │
│  │ createdAt   TIMESTAMP                                          │      │
│  │ updatedAt   TIMESTAMP                                          │      │
│  └──────────────────────────────────────────────────────────────┘      │
└───────┬──────────────────────┬────────────────────┬────────────────────┘
        │                      │                    │
        │ 1:N                  │ 1:N                │ 1:N
        │                      │                    │
        ▼                      ▼                    ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ FRIEND_REQUEST   │  │   FRIENDSHIP     │  │    MESSAGE       │
│  (as sender)     │  │  (as user1)      │  │  (as sender)     │
└──────────────────┘  └──────────────────┘  └──────────────────┘
        │                      │                    │
        │ 1:N                  │ 1:N                │ 1:N
        │                      │                    │
        ▼                      ▼                    ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ FRIEND_REQUEST   │  │   FRIENDSHIP     │  │    MESSAGE       │
│  (as receiver)   │  │  (as user2)      │  │  (as receiver)   │
└──────────────────┘  └──────────────────┘  └──────────────────┘


Detailed Relationships:

USER ──────► FRIEND_REQUEST (as sender)
│           ├─ id: UUID
│           ├─ senderId: UUID → User.id
│           ├─ receiverId: UUID → User.id
│           ├─ status: PENDING | ACCEPTED | REJECTED
│           ├─ createdAt: TIMESTAMP
│           └─ updatedAt: TIMESTAMP
│
USER ──────► FRIEND_REQUEST (as receiver)
│
│
USER ──────► FRIENDSHIP (as user1)
│           ├─ id: UUID
│           ├─ user1Id: UUID → User.id (lower UUID)
│           ├─ user2Id: UUID → User.id (higher UUID)
│           └─ createdAt: TIMESTAMP
│
USER ──────► FRIENDSHIP (as user2)
│
│
USER ──────► MESSAGE (as sender)
│           ├─ id: UUID
│           ├─ senderId: UUID → User.id
│           ├─ receiverId: UUID → User.id
│           ├─ content: TEXT
│           └─ createdAt: TIMESTAMP
│
USER ──────► MESSAGE (as receiver)
```

---

## Entities

### User

Represents registered users in the system.

**Table Name:** `users`

**Fields:**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid() | Unique user identifier |
| `name` | VARCHAR | NOT NULL | User's display name |
| `email` | VARCHAR | NOT NULL, UNIQUE | User's email (used for login) |
| `password` | VARCHAR | NOT NULL | bcrypt hashed password |
| `createdAt` | TIMESTAMP | DEFAULT now() | Account creation timestamp |
| `updatedAt` | TIMESTAMP | AUTO-UPDATE | Last modification timestamp |

**Indexes:**
- Primary key on `id`
- Unique index on `email`

**Relations:**
- `sentFriendRequests` - Friend requests sent by this user
- `receivedFriendRequests` - Friend requests received by this user
- `friendshipsAsUser1` - Friendships where this user is user1
- `friendshipsAsUser2` - Friendships where this user is user2
- `sentMessages` - Messages sent by this user
- `receivedMessages` - Messages received by this user

**Prisma Schema:**
```prisma
model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  sentFriendRequests     FriendRequest[] @relation("SentRequests")
  receivedFriendRequests FriendRequest[] @relation("ReceivedRequests")
  friendshipsAsUser1     Friendship[]    @relation("User1Friendships")
  friendshipsAsUser2     Friendship[]    @relation("User2Friendships")
  sentMessages           Message[]       @relation("SentMessages")
  receivedMessages       Message[]       @relation("ReceivedMessages")

  @@map("users")
}
```

**Example:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "$2b$10$KIXxUw...",
  "createdAt": "2026-07-28T10:00:00.000Z",
  "updatedAt": "2026-07-28T10:00:00.000Z"
}
```

---

### FriendRequest

Represents friend requests between users. Status can be PENDING, ACCEPTED, or REJECTED.

**Table Name:** `friend_requests`

**Fields:**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid() | Unique request identifier |
| `senderId` | UUID | NOT NULL, FOREIGN KEY → users.id | User who sent the request |
| `receiverId` | UUID | NOT NULL, FOREIGN KEY → users.id | User who received the request |
| `status` | ENUM | NOT NULL, DEFAULT 'PENDING' | Request status |
| `createdAt` | TIMESTAMP | DEFAULT now() | Request creation timestamp |
| `updatedAt` | TIMESTAMP | AUTO-UPDATE | Last modification timestamp |

**Enum Values (status):**
- `PENDING` - Request sent, awaiting response
- `ACCEPTED` - Request accepted (triggers Friendship creation)
- `REJECTED` - Request rejected

**Indexes:**
- Primary key on `id`
- Unique constraint on `(senderId, receiverId)` - Prevents duplicate requests
- Index on `senderId` - Fast lookup of sent requests
- Index on `receiverId` - Fast lookup of received requests
- Index on `status` - Filter by status

**Relations:**
- `sender` - User who sent the request
- `receiver` - User who received the request

**Cascade Behavior:**
- `ON DELETE CASCADE` - When user deleted, their friend requests are deleted

**Prisma Schema:**
```prisma
enum FriendRequestStatus {
  PENDING
  ACCEPTED
  REJECTED

  @@map("friend_request_status")
}

model FriendRequest {
  id         String              @id @default(uuid())
  senderId   String
  receiverId String
  status     FriendRequestStatus @default(PENDING)
  createdAt  DateTime            @default(now())
  updatedAt  DateTime            @updatedAt

  sender   User @relation("SentRequests", fields: [senderId], references: [id], onDelete: Cascade)
  receiver User @relation("ReceivedRequests", fields: [receiverId], references: [id], onDelete: Cascade)

  @@unique([senderId, receiverId])
  @@index([senderId])
  @@index([receiverId])
  @@index([status])
  @@map("friend_requests")
}
```

**Example:**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "senderId": "550e8400-e29b-41d4-a716-446655440000",
  "receiverId": "550e8400-e29b-41d4-a716-446655440002",
  "status": "PENDING",
  "createdAt": "2026-07-28T10:05:00.000Z",
  "updatedAt": "2026-07-28T10:05:00.000Z"
}
```

---

### Friendship

Represents established friendships (mutual acceptance of friend requests). Uses a canonical ordering (user1Id < user2Id) to avoid duplicates.

**Table Name:** `friendships`

**Fields:**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid() | Unique friendship identifier |
| `user1Id` | UUID | NOT NULL, FOREIGN KEY → users.id | First user (lower UUID) |
| `user2Id` | UUID | NOT NULL, FOREIGN KEY → users.id | Second user (higher UUID) |
| `createdAt` | TIMESTAMP | DEFAULT now() | Friendship creation timestamp |

**Indexes:**
- Primary key on `id`
- Unique constraint on `(user1Id, user2Id)` - Prevents duplicate friendships
- Index on `user1Id` - Fast lookup of user's friends
- Index on `user2Id` - Fast lookup of user's friends

**Relations:**
- `user1` - First user in the friendship
- `user2` - Second user in the friendship

**Cascade Behavior:**
- `ON DELETE CASCADE` - When user deleted, their friendships are deleted

**Canonical Ordering:**
```typescript
// Ensure user1Id < user2Id
const [user1Id, user2Id] = [userId, friendId].sort();
await prisma.friendship.create({
  data: { user1Id, user2Id }
});
```

**Prisma Schema:**
```prisma
model Friendship {
  id        String   @id @default(uuid())
  user1Id   String
  user2Id   String
  createdAt DateTime @default(now())

  user1 User @relation("User1Friendships", fields: [user1Id], references: [id], onDelete: Cascade)
  user2 User @relation("User2Friendships", fields: [user2Id], references: [id], onDelete: Cascade)

  @@unique([user1Id, user2Id])
  @@index([user1Id])
  @@index([user2Id])
  @@map("friendships")
}
```

**Example:**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440003",
  "user1Id": "550e8400-e29b-41d4-a716-446655440000",
  "user2Id": "550e8400-e29b-41d4-a716-446655440002",
  "createdAt": "2026-07-28T10:10:00.000Z"
}
```

**Querying Friendships:**
```typescript
// Get all friends of a user
const friendships = await prisma.friendship.findMany({
  where: {
    OR: [
      { user1Id: userId },
      { user2Id: userId }
    ]
  },
  include: {
    user1: true,
    user2: true
  }
});

// Extract friend user objects
const friends = friendships.map(f =>
  f.user1Id === userId ? f.user2 : f.user1
);
```

---

### Message

Represents chat messages between friends.

**Table Name:** `messages`

**Fields:**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid() | Unique message identifier |
| `senderId` | UUID | NOT NULL, FOREIGN KEY → users.id | User who sent the message |
| `receiverId` | UUID | NOT NULL, FOREIGN KEY → users.id | User who received the message |
| `content` | TEXT | NOT NULL | Message content (unlimited length) |
| `createdAt` | TIMESTAMP | DEFAULT now() | Message timestamp |

**Indexes:**
- Primary key on `id`
- Index on `senderId` - Fast lookup of sent messages
- Index on `receiverId` - Fast lookup of received messages
- Index on `createdAt` - Order messages by time

**Relations:**
- `sender` - User who sent the message
- `receiver` - User who received the message

**Cascade Behavior:**
- `ON DELETE CASCADE` - When user deleted, their messages are deleted

**Prisma Schema:**
```prisma
model Message {
  id         String   @id @default(uuid())
  senderId   String
  receiverId String
  content    String   @db.Text
  createdAt  DateTime @default(now())

  sender   User @relation("SentMessages", fields: [senderId], references: [id], onDelete: Cascade)
  receiver User @relation("ReceivedMessages", fields: [receiverId], references: [id], onDelete: Cascade)

  @@index([senderId])
  @@index([receiverId])
  @@index([createdAt])
  @@map("messages")
}
```

**Example:**
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440004",
  "senderId": "550e8400-e29b-41d4-a716-446655440000",
  "receiverId": "550e8400-e29b-41d4-a716-446655440002",
  "content": "Hey! How are you?",
  "createdAt": "2026-07-28T10:15:00.000Z"
}
```

**Querying Conversations:**
```typescript
// Get conversation between two users
const messages = await prisma.message.findMany({
  where: {
    OR: [
      { senderId: user1Id, receiverId: user2Id },
      { senderId: user2Id, receiverId: user1Id }
    ]
  },
  orderBy: { createdAt: 'desc' },
  take: 50, // Last 50 messages
  include: {
    sender: { select: { id: true, name: true, email: true } },
    receiver: { select: { id: true, name: true, email: true } }
  }
});
```

---

## Relationships

### User Relationships

**1:N Relationships:**

| Relation | Type | Description |
|----------|------|-------------|
| User → FriendRequest (sent) | One-to-Many | A user can send many friend requests |
| User → FriendRequest (received) | One-to-Many | A user can receive many friend requests |
| User → Friendship (as user1) | One-to-Many | A user can have many friendships (as user1) |
| User → Friendship (as user2) | One-to-Many | A user can have many friendships (as user2) |
| User → Message (sent) | One-to-Many | A user can send many messages |
| User → Message (received) | One-to-Many | A user can receive many messages |

**Self-Referential Relationships:**

| Entity | Type | Description |
|--------|------|-------------|
| FriendRequest | User → User | Sender and Receiver are both Users |
| Friendship | User → User | User1 and User2 are both Users |
| Message | User → User | Sender and Receiver are both Users |

---

## Indexes & Constraints

### Primary Keys

All tables use UUID primary keys generated via `uuid()` function:
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
```

### Unique Constraints

| Table | Columns | Purpose |
|-------|---------|---------|
| `users` | `email` | Prevent duplicate email addresses |
| `friend_requests` | `(senderId, receiverId)` | Prevent duplicate requests between same users |
| `friendships` | `(user1Id, user2Id)` | Prevent duplicate friendships |

### Foreign Keys

| Table | Column | References | On Delete |
|-------|--------|------------|-----------|
| `friend_requests` | `senderId` | `users.id` | CASCADE |
| `friend_requests` | `receiverId` | `users.id` | CASCADE |
| `friendships` | `user1Id` | `users.id` | CASCADE |
| `friendships` | `user2Id` | `users.id` | CASCADE |
| `messages` | `senderId` | `users.id` | CASCADE |
| `messages` | `receiverId` | `users.id` | CASCADE |

**Cascade Delete Behavior:**
- Deleting a user automatically deletes:
  - All their friend requests (sent and received)
  - All their friendships
  - All their messages (sent and received)

### Indexes for Performance

**FriendRequest:**
- `senderId` - Fast lookup: "Show me all requests I sent"
- `receiverId` - Fast lookup: "Show me all requests I received"
- `status` - Filter: "Show me all PENDING requests"

**Friendship:**
- `user1Id` - Fast lookup: "Show me all friendships involving this user"
- `user2Id` - Fast lookup: "Show me all friendships involving this user"

**Message:**
- `senderId` - Fast lookup: "Show me all messages I sent"
- `receiverId` - Fast lookup: "Show me all messages I received"
- `createdAt` - Ordering: "Show messages in chronological order"

---

## Migrations

### Migration Workflow

**Development:**
```bash
# Create migration after schema changes
npx prisma migrate dev --name add_new_feature

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

**Production:**
```bash
# Apply migrations without prompts
npx prisma migrate deploy
```

### Migration Files

Stored in `prisma/migrations/` directory:
```
prisma/migrations/
├── 20260728100000_init/
│   └── migration.sql
├── 20260728110000_add_friend_requests/
│   └── migration.sql
└── migration_lock.toml
```

### Initial Migration

```sql
-- CreateEnum
CREATE TYPE "friend_request_status" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "friend_requests" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "status" "friend_request_status" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "friend_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "friendships" (
    "id" TEXT NOT NULL,
    "user1Id" TEXT NOT NULL,
    "user2Id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "friendships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "friend_requests_senderId_idx" ON "friend_requests"("senderId");
CREATE INDEX "friend_requests_receiverId_idx" ON "friend_requests"("receiverId");
CREATE INDEX "friend_requests_status_idx" ON "friend_requests"("status");
CREATE UNIQUE INDEX "friend_requests_senderId_receiverId_key" ON "friend_requests"("senderId", "receiverId");

-- CreateIndex
CREATE INDEX "friendships_user1Id_idx" ON "friendships"("user1Id");
CREATE INDEX "friendships_user2Id_idx" ON "friendships"("user2Id");
CREATE UNIQUE INDEX "friendships_user1Id_user2Id_key" ON "friendships"("user1Id", "user2Id");

-- CreateIndex
CREATE INDEX "messages_senderId_idx" ON "messages"("senderId");
CREATE INDEX "messages_receiverId_idx" ON "messages"("receiverId");
CREATE INDEX "messages_createdAt_idx" ON "messages"("createdAt");

-- AddForeignKey
ALTER TABLE "friend_requests" ADD CONSTRAINT "friend_requests_senderId_fkey"
  FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "friend_requests" ADD CONSTRAINT "friend_requests_receiverId_fkey"
  FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "friendships" ADD CONSTRAINT "friendships_user1Id_fkey"
  FOREIGN KEY ("user1Id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "friendships" ADD CONSTRAINT "friendships_user2Id_fkey"
  FOREIGN KEY ("user2Id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_fkey"
  FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "messages" ADD CONSTRAINT "messages_receiverId_fkey"
  FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

---

## Seeding

### Seed Script

Located at `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const demoEmail = process.env.SEED_DEMO_EMAIL || 'demo@nestconnect.dev';
  const demoPassword = process.env.SEED_DEMO_PASSWORD || 'demopass123';
  const demoName = process.env.SEED_DEMO_NAME || 'Demo User';

  const hashedPassword = await bcrypt.hash(demoPassword, 10);

  const user = await prisma.user.upsert({
    where: { email: demoEmail },
    update: {},
    create: {
      email: demoEmail,
      name: demoName,
      password: hashedPassword,
    },
  });

  console.log('Seed complete:', user.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

### Running Seed

```bash
# Run seed script
npm run prisma:seed

# Seed with custom values
SEED_DEMO_EMAIL=admin@example.com \
SEED_DEMO_PASSWORD=secure123 \
SEED_DEMO_NAME="Admin User" \
npm run prisma:seed
```

**Default Demo User:**
- Email: `demo@nestconnect.dev`
- Password: `demopass123`
- Name: `Demo User`

---

## Database Operations

### Common Queries

**Create User:**
```typescript
const user = await prisma.user.create({
  data: {
    name: 'John Doe',
    email: 'john@example.com',
    password: hashedPassword
  }
});
```

**Check Friendship:**
```typescript
const friendship = await prisma.friendship.findFirst({
  where: {
    OR: [
      { user1Id: userId, user2Id: friendId },
      { user1Id: friendId, user2Id: userId }
    ]
  }
});
const areFriends = friendship !== null;
```

**Get Friend List:**
```typescript
const friendships = await prisma.friendship.findMany({
  where: {
    OR: [{ user1Id: userId }, { user2Id: userId }]
  },
  include: {
    user1: { select: { id: true, name: true, email: true } },
    user2: { select: { id: true, name: true, email: true } }
  }
});

const friends = friendships.map(f =>
  f.user1Id === userId ? f.user2 : f.user1
);
```

**Get Pending Requests:**
```typescript
const requests = await prisma.friendRequest.findMany({
  where: {
    receiverId: userId,
    status: 'PENDING'
  },
  include: {
    sender: { select: { id: true, name: true, email: true } }
  },
  orderBy: { createdAt: 'desc' }
});
```

---

## Best Practices

### Schema Design

1. **Use UUIDs for primary keys** - Better for distributed systems
2. **Add indexes on foreign keys** - Faster joins and lookups
3. **Use enums for status fields** - Type-safe, constrained values
4. **Cascade deletes** - Maintain referential integrity
5. **Timestamps** - Track creation and modification

### Query Optimization

1. **Select only needed fields** - Use `select` clause
2. **Use indexes** - Add indexes on frequently queried columns
3. **Limit results** - Always paginate large queries
4. **Use transactions** - For multi-step operations

### Data Integrity

1. **Unique constraints** - Prevent duplicate data
2. **Foreign keys** - Enforce relationships
3. **Validation** - Check data before insertion (DTO validation)
4. **Canonical ordering** - For bidirectional relationships (Friendship)

---

## Next Steps

- **API Reference:** See [API.md](./API.md) for endpoint documentation
- **Architecture:** See [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
- **Prisma Client:** See [Prisma Docs](https://www.prisma.io/docs) for advanced usage

---

**Last Updated:** 2026-07-28
**Schema Version:** 1.0
