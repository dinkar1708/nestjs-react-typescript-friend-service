# Users

User profile management and browsing functionality.

## Overview

The users module allows viewing user profiles and browsing all registered users in the system.

## Features

| Feature | Backend | Web | Mobile |
|---------|---------|-----|--------|
| Browse users | Done | Not implemented | Planned |
| User profile | Done | Not implemented | Planned |
| Update profile | Not implemented | Not implemented | Planned |
| Delete account | Not implemented | Not implemented | Planned |

## Backend Implementation

**Location:** `backend-api/src/users/`

### Components

- **Controller:** `users.controller.ts`
- **Service:** `users.service.ts`
- **Module:** `users.module.ts`

### API Endpoints

#### Get All Users
```http
GET /api/v1/users
Authorization: Bearer <accessToken>
```

**Response:**
```json
[
  {
    "id": "uuid-1",
    "email": "user1@example.com",
    "name": "User One",
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  },
  {
    "id": "uuid-2",
    "email": "user2@example.com",
    "name": "User Two",
    "createdAt": "2026-01-02T00:00:00.000Z",
    "updatedAt": "2026-01-02T00:00:00.000Z"
  }
]
```

#### Get User by ID
```http
GET /api/v1/users/:id
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "id": "uuid-1",
  "email": "user1@example.com",
  "name": "User One",
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `404 Not Found` - User does not exist

### Security

- Authentication required - All endpoints require valid JWT token
- Password excluded - Never returned in responses
- Input validation - UUID validation for user IDs

## Database Schema

**Table:** `User`

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String   // Never exposed in API responses
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  sentFriendRequests     FriendRequest[] @relation("Requester")
  receivedFriendRequests FriendRequest[] @relation("Receiver")
  friendsAsUser1         Friend[]        @relation("User1")
  friendsAsUser2         Friend[]        @relation("User2")
  sentMessages           Message[]       @relation("Sender")
  receivedMessages       Message[]       @relation("Receiver")
}
```

## Testing

**Backend Tests:** `backend-api/test/app.e2e-spec.ts`
- Get all users (requires authentication)
- Get user by ID
- Unauthorized access returns 401

Run tests: `cd backend-api && npm run test:e2e`

## Web Implementation

Not implemented yet.

Planned: User list, profile view, avatars, profile editing

## Known Limitations

1. **No pagination** - Returns all users (will be slow with many users)
2. **No filtering** - Cannot filter by name, email, etc.
3. **No sorting** - Users returned in database order
4. **No search** - Cannot search for specific users
5. **No user avatar** - No profile picture support
6. **No profile updates** - Users cannot update their own profile
7. **No privacy settings** - All users visible to all authenticated users

## Future Enhancements

- Pagination for user list
- Search and filter users
- Sorting options
- User avatars/profile pictures
- Update own profile
- Privacy settings
- User bio/about section
- Last seen/online status
- Blocked users list
- Delete account functionality

## Related Documentation

- [Authentication](./authentication.md)
- [Friends](./friends.md)
- [API Documentation](../core/architecture/API.md)
- [Database Schema](../core/architecture/DATABASE_SCHEMA.md)
