# Chat

Real-time messaging system with WebSocket support.

## Overview

The chat module provides one-to-one messaging between friends with real-time delivery using WebSockets (Socket.io).

## Features

| Feature | Backend | Web | Mobile |
|---------|---------|-----|--------|
| Send message | Done | Not implemented | Planned |
| View conversation | Done | Not implemented | Planned |
| Real-time delivery (WebSocket) | Done | Not implemented | Planned |
| Message history | Done | Not implemented | Planned |
| Typing indicators | Not implemented | Not implemented | Planned |
| Read receipts | Not implemented | Not implemented | Planned |
| Message editing | Not implemented | Not implemented | Planned |
| Message deletion | Not implemented | Not implemented | Planned |

## Backend Implementation

**Location:** `backend-api/src/chat/`

### Components

- **Gateway:** `chat.gateway.ts` - WebSocket event handling
- **Service:** `chat.service.ts` - Business logic
- **DTOs:**
  - `send-message.dto.ts`
- **Module:** `chat.module.ts`

### WebSocket Events

**Namespace:** `/chat`

**Server URL:** `ws://localhost:4000/chat`

#### Client → Server Events

##### `send_message`
Send a new message to another user.

**Payload:**
```typescript
{
  "receiverId": "uuid-of-receiver",
  "content": "Hello, how are you?"
}
```

**Authentication:** Requires valid JWT token in handshake

**Server Response (to sender):**
```typescript
{
  "id": "message-uuid",
  "senderId": "your-uuid",
  "receiverId": "receiver-uuid",
  "content": "Hello, how are you?",
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

**Server Emit (to receiver):**
Event: `new_message`
```typescript
{
  "id": "message-uuid",
  "senderId": "sender-uuid",
  "receiverId": "your-uuid",
  "content": "Hello, how are you?",
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

### REST API Endpoints

#### Get Conversation
```http
GET /api/v1/chat/conversation/:userId
Authorization: Bearer <accessToken>
```

**Description:** Get message history with a specific user.

**Response:**
```json
[
  {
    "id": "msg-uuid-1",
    "senderId": "user-uuid-1",
    "receiverId": "user-uuid-2",
    "content": "Hi there!",
    "createdAt": "2026-01-01T10:00:00.000Z"
  },
  {
    "id": "msg-uuid-2",
    "senderId": "user-uuid-2",
    "receiverId": "user-uuid-1",
    "content": "Hello! How are you?",
    "createdAt": "2026-01-01T10:01:00.000Z"
  }
]
```

**Ordering:** Messages sorted by `createdAt` ascending (oldest first)

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `404 Not Found` - User not found

#### Send Message (HTTP)
```http
POST /api/v1/chat/send
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "receiverId": "uuid-of-receiver",
  "content": "Hello via HTTP!"
}
```

**Response:**
```json
{
  "id": "message-uuid",
  "senderId": "your-uuid",
  "receiverId": "receiver-uuid",
  "content": "Hello via HTTP!",
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

**Note:** HTTP endpoint provided for fallback, but WebSocket is preferred for real-time chat.

### Security

- WebSocket Authentication - JWT token required in connection handshake
- Message validation - Content length and format validated
- Friend-only messaging - Users can only message their friends

**TODO:**
- Rate limiting for message sending
- Message encryption

### WebSocket Connection

**Client Connection Example (JavaScript):**
```javascript
import { io } from 'socket.io-client';

const token = localStorage.getItem('accessToken');

const socket = io('http://localhost:4000/chat', {
  auth: {
    token: `Bearer ${token}`
  }
});

// Listen for new messages
socket.on('new_message', (message) => {
  console.log('New message:', message);
});

// Send message
socket.emit('send_message', {
  receiverId: 'uuid-of-friend',
  content: 'Hello!'
});
```

## Database Schema

**Table:** `Message`

```prisma
model Message {
  id         String   @id @default(uuid())
  senderId   String
  receiverId String
  content    String
  createdAt  DateTime @default(now())

  sender   User @relation("Sender", fields: [senderId], references: [id])
  receiver User @relation("Receiver", fields: [receiverId], references: [id])

  @@index([senderId, receiverId])
  @@index([receiverId, senderId])
}
```

## Testing

**Backend Tests:** `backend-api/test/app.e2e-spec.ts`
- Send message via HTTP
- Get conversation history
- WebSocket connection with authentication
- WebSocket message sending
- Real-time message delivery
- Unauthorized access returns 401

Run tests: `cd backend-api && npm run test:e2e`

## Web Implementation

Not implemented yet.

Planned: Chat interface, real-time updates, send message form, conversation list, online status

## Known Limitations

1. **No pagination** - Returns entire conversation history (memory issue with long conversations)
2. **No typing indicators** - Cannot see when other user is typing
3. **No read receipts** - Cannot see if message was read
4. **No message editing** - Cannot edit sent messages
5. **No message deletion** - Cannot delete messages
6. **No file attachments** - Text messages only
7. **No group chat** - Only one-to-one messaging
8. **No message search** - Cannot search conversation history
9. **No message reactions** - No emoji reactions
10. **No offline message queue** - Messages only sent when online

## Future Enhancements

- Pagination for message history
- Typing indicators
- Read receipts
- Edit/delete messages
- File attachments
- Voice/video messages
- Group chat support
- Message search
- Emoji reactions
- Message forwarding
- Offline message queue
- Push notifications
- Message encryption (E2E)
- Voice/video calling (WebRTC)

## Performance Considerations

**Current Implementation:**
- Messages stored in PostgreSQL
- No caching layer
- No message pagination
- All conversation history loaded at once

**Recommended Improvements:**
- Add Redis for real-time message caching
- Implement pagination (load 50 messages at a time)
- Add database indexes for faster queries (already exists)
- Consider message archiving for old conversations

## Related Documentation

- [Friends](./friends.md)
- [WebRTC Demo](./webrtc-demo.md)
- [API Documentation](../core/architecture/API.md)
- [Database Schema](../core/architecture/DATABASE_SCHEMA.md)
- [WebSocket Configuration](../core/architecture/ARCHITECTURE.md)
