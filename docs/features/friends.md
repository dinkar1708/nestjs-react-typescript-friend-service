# Friends

Friend request and friend management system.

## Overview

The friends module enables users to send friend requests, accept or reject requests, view their friend list, and remove friends.

## Features

| Feature | Backend | Web | Mobile |
|---------|---------|-----|--------|
| Send friend request | Done | Not implemented | Planned |
| Accept request | Done | Not implemented | Planned |
| Reject request | Done | Not implemented | Planned |
| Friend list | Done | Not implemented | Planned |
| Remove friend | Done | Not implemented | Planned |
| Pending requests | Done | Not implemented | Planned |

## Backend Implementation

**Location:** `backend-api/src/friends/`

### Components

- **Controller:** `friends.controller.ts`
- **Service:** `friends.service.ts`
- **DTOs:**
  - `send-friend-request.dto.ts`
  - `respond-friend-request.dto.ts`
- **Module:** `friends.module.ts`

### API Endpoints

#### Send Friend Request
```http
POST /api/v1/friends/request
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "receiverId": "uuid-of-other-user"
}
```

**Response:**
```json
{
  "id": "request-uuid",
  "requesterId": "your-uuid",
  "receiverId": "other-user-uuid",
  "status": "PENDING",
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request` - Cannot send request to yourself
- `400 Bad Request` - Request already exists
- `404 Not Found` - Receiver user not found

#### Get Pending Requests (Received)
```http
GET /api/v1/friends/requests
Authorization: Bearer <accessToken>
```

**Response:**
```json
[
  {
    "id": "request-uuid",
    "requester": {
      "id": "user-uuid",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "status": "PENDING",
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
]
```

#### Accept Friend Request
```http
POST /api/v1/friends/accept
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "requestId": "request-uuid"
}
```

**Response:**
```json
{
  "id": "friendship-uuid",
  "user1Id": "user-uuid-1",
  "user2Id": "user-uuid-2",
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `404 Not Found` - Friend request not found
- `403 Forbidden` - Not authorized to accept this request
- `400 Bad Request` - Request already responded to

#### Reject Friend Request
```http
POST /api/v1/friends/reject
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "requestId": "request-uuid"
}
```

**Response:**
```json
{
  "id": "request-uuid",
  "status": "REJECTED"
}
```

#### Get Friend List
```http
GET /api/v1/friends
Authorization: Bearer <accessToken>
```

**Response:**
```json
[
  {
    "id": "user-uuid",
    "name": "Alice Smith",
    "email": "alice@example.com",
    "createdAt": "2026-01-01T00:00:00.000Z"
  },
  {
    "id": "user-uuid-2",
    "name": "Bob Johnson",
    "email": "bob@example.com",
    "createdAt": "2026-01-02T00:00:00.000Z"
  }
]
```

#### Remove Friend
```http
DELETE /api/v1/friends/:friendId
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "message": "Friend removed successfully"
}
```

**Error Responses:**
- `404 Not Found` - Friendship not found
- `403 Forbidden` - Not authorized to remove this friendship

### Business Logic

**Friend Request States:**
1. `PENDING` - Request sent, awaiting response
2. `ACCEPTED` - Request accepted, friendship created
3. `REJECTED` - Request rejected

**Rules:**
- Users cannot send friend requests to themselves
- Users cannot send duplicate requests
- Only the receiver can accept/reject a request
- Accepting a request creates a bidirectional friendship
- Rejecting a request marks it as rejected (can be deleted later)
- Removing a friend deletes the friendship record

## Database Schema

**Table:** `FriendRequest`

```prisma
model FriendRequest {
  id          String   @id @default(uuid())
  requesterId String
  receiverId  String
  status      String   @default("PENDING") // PENDING, ACCEPTED, REJECTED
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  requester User @relation("Requester", fields: [requesterId], references: [id])
  receiver  User @relation("Receiver", fields: [receiverId], references: [id])

  @@unique([requesterId, receiverId])
  @@index([receiverId])
}
```

**Table:** `Friend`

```prisma
model Friend {
  id        String   @id @default(uuid())
  user1Id   String
  user2Id   String
  createdAt DateTime @default(now())

  user1 User @relation("User1", fields: [user1Id], references: [id])
  user2 User @relation("User2", fields: [user2Id], references: [id])

  @@unique([user1Id, user2Id])
  @@index([user1Id])
  @@index([user2Id])
}
```

## Testing

**Backend Tests:** `backend-api/test/app.e2e-spec.ts`
- Send friend request
- Get pending friend requests
- Accept/reject friend request
- Get friend list
- Remove friend
- Error cases

Run tests: `cd backend-api && npm run test:e2e`

## Web Implementation

Not implemented yet.

Planned: Friend list page, request buttons, notifications, accept/reject UI

## Known Limitations

1. **No request cancellation** - Cannot cancel a sent friend request
2. **No pagination** - Returns all friends/requests (will be slow with many friends)
3. **No search in friends** - Cannot search friend list
4. **No friend suggestions** - No mutual friends or recommendations
5. **No blocking** - Cannot block users
6. **Rejected requests persist** - No auto-cleanup of rejected requests
7. **No notifications** - Users not notified of new friend requests

## Future Enhancements

- Cancel pending friend request
- Pagination for friend list and requests
- Search friends by name
- Friend suggestions (mutual friends)
- Block/unblock users
- Auto-delete rejected requests after 30 days
- Real-time notifications for new requests
- Favorite friends feature
- Friend groups/categories
- Privacy settings

## Related Documentation

- [Users](./users.md)
- [Chat](./chat.md)
- [API Documentation](../core/architecture/API.md)
- [Database Schema](../core/architecture/DATABASE_SCHEMA.md)
