# API Reference

Complete REST API specification with all endpoints, request/response examples, and WebSocket documentation.

---

## Table of Contents

- [Base URL](#base-url)
- [Authentication](#authentication)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Authentication Endpoints](#authentication-endpoints)
- [User Endpoints](#user-endpoints)
- [Friend Endpoints](#friend-endpoints)
- [Chat Endpoints](#chat-endpoints)
- [WebSocket API](#websocket-api)
- [Rate Limiting](#rate-limiting)
- [Example Clients](#example-clients)

---

## Base URL

**Local Development:**
```
http://localhost:4000
```

**API Base Path:**
```
/api/v1
```

**All endpoints:** `http://localhost:4000/api/v1/{endpoint}`

**Swagger Documentation:**
```
http://localhost:4000/api
```

**Health Check:**
```
GET http://localhost:4000/health
```

---

## Authentication

All endpoints except authentication routes require a **JWT Bearer token**.

### Request Headers

```http
Authorization: Bearer <your-jwt-access-token>
Content-Type: application/json
```

### Public Endpoints (No Auth Required)

- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/signin`
- `POST /api/v1/auth/refresh-token`
- `GET /health`

### Protected Endpoints

All other endpoints require authentication.

### Token Lifecycle

**Access Token:**
- Lifetime: 1 hour (configurable via `JWT_ACCESS_TOKEN_EXPIRES_IN`)
- Use for: All API requests
- Expiry: Refresh using refresh token

**Refresh Token:**
- Lifetime: 7 days (configurable via `JWT_REFRESH_TOKEN_EXPIRES_IN`)
- Use for: Obtaining new access tokens
- Endpoint: `POST /api/v1/auth/refresh-token`

---

## Response Format

### Success Response

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john@example.com"
}
```

### Error Response

```json
{
  "statusCode": 401,
  "message": "Invalid email or password",
  "error": "Unauthorized"
}
```

**Standard Error Fields:**
- `statusCode` - HTTP status code
- `message` - Human-readable error message
- `error` - Error type

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | When |
|------|---------|------|
| `200` | OK | Request successful |
| `201` | Created | Resource created successfully |
| `400` | Bad Request | Invalid request data (validation error) |
| `401` | Unauthorized | Missing or invalid authentication token |
| `403` | Forbidden | Authenticated but not authorized |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Resource already exists (e.g., duplicate email) |
| `500` | Internal Server Error | Server error |

### Common Error Scenarios

**Validation Error (400):**
```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be longer than 6 characters"
  ],
  "error": "Bad Request"
}
```

**Authentication Error (401):**
```json
{
  "statusCode": 401,
  "message": "Invalid email or password",
  "error": "Unauthorized"
}
```

**Authorization Error (403):**
```json
{
  "statusCode": 403,
  "message": "Can only chat with friends",
  "error": "Forbidden"
}
```

**Not Found Error (404):**
```json
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}
```

**Conflict Error (409):**
```json
{
  "statusCode": 409,
  "message": "Email already registered",
  "error": "Conflict"
}
```

---

## Authentication Endpoints

### Sign Up

Register a new user account.

```http
POST /api/v1/auth/signup
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Validation Rules:**
- `name` - Required, string
- `email` - Required, valid email format, unique
- `password` - Required, minimum 6 characters

**Success Response (201):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

**400 - Validation Error:**
```json
{
  "statusCode": 400,
  "message": ["email must be an email"],
  "error": "Bad Request"
}
```

**409 - Email Already Registered:**
```json
{
  "statusCode": 409,
  "message": "Email already registered",
  "error": "Conflict"
}
```

**Example (curl):**
```bash
curl -X POST http://localhost:4000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securePassword123"
  }'
```

---

### Sign In

Login with email and password.

```http
POST /api/v1/auth/signin
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Validation Rules:**
- `email` - Required, valid email format
- `password` - Required

**Success Response (200):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

**401 - Invalid Credentials:**
```json
{
  "statusCode": 401,
  "message": "Invalid email or password",
  "error": "Unauthorized"
}
```

**Example (curl):**
```bash
curl -X POST http://localhost:4000/api/v1/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securePassword123"
  }'
```

---

### Refresh Token

Obtain new access and refresh tokens using a valid refresh token.

```http
POST /api/v1/auth/refresh-token
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

**400 - Missing Token:**
```json
{
  "statusCode": 400,
  "message": "refreshToken should not be empty",
  "error": "Bad Request"
}
```

**401 - Invalid Token:**
```json
{
  "statusCode": 401,
  "message": "Invalid or expired refresh token",
  "error": "Unauthorized"
}
```

**Example (curl):**
```bash
curl -X POST http://localhost:4000/api/v1/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "your-refresh-token-here"
  }'
```

---

## User Endpoints

### Browse Users

Get list of all registered users (excluding the authenticated user).

```http
GET /api/v1/users
```

**Query Parameters:**
- `search` (optional) - Search by name or email

**Authentication:** Required (Bearer token)

**Success Response (200):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "createdAt": "2026-07-28T10:00:00.000Z"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "name": "Bob Johnson",
    "email": "bob@example.com",
    "createdAt": "2026-07-28T11:00:00.000Z"
  }
]
```

**With Search:**
```http
GET /api/v1/users?search=jane
```

Returns users matching "jane" in name or email.

**Example (curl):**
```bash
curl -X GET http://localhost:4000/api/v1/users \
  -H "Authorization: Bearer your-access-token"

# With search
curl -X GET "http://localhost:4000/api/v1/users?search=jane" \
  -H "Authorization: Bearer your-access-token"
```

---

### Get User by ID

Retrieve details for a specific user.

```http
GET /api/v1/users/:id
```

**Path Parameters:**
- `id` - User ID (UUID)

**Authentication:** Required (Bearer token)

**Success Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "createdAt": "2026-07-28T10:00:00.000Z"
}
```

**Error Responses:**

**404 - User Not Found:**
```json
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}
```

**Example (curl):**
```bash
curl -X GET http://localhost:4000/api/v1/users/550e8400-e29b-41d4-a716-446655440001 \
  -H "Authorization: Bearer your-access-token"
```

---

## Friend Endpoints

### Send Friend Request

Send a friend request to another user.

```http
POST /api/v1/friends/request
```

**Request Body:**
```json
{
  "receiverId": "550e8400-e29b-41d4-a716-446655440001"
}
```

**Authentication:** Required (Bearer token)

**Success Response (201):**

**Case 1: New Request Sent**
```json
{
  "message": "Friend request sent",
  "status": "PENDING",
  "request": {
    "id": "660e8400-e29b-41d4-a716-446655440003",
    "senderId": "550e8400-e29b-41d4-a716-446655440000",
    "receiverId": "550e8400-e29b-41d4-a716-446655440001",
    "status": "PENDING",
    "createdAt": "2026-07-28T12:00:00.000Z"
  }
}
```

**Case 2: Mutual Request - Friendship Created**
```json
{
  "message": "Friend request accepted automatically (mutual request)",
  "status": "ACCEPTED",
  "friendshipCreated": true,
  "friendship": {
    "id": "770e8400-e29b-41d4-a716-446655440004",
    "user1Id": "550e8400-e29b-41d4-a716-446655440000",
    "user2Id": "550e8400-e29b-41d4-a716-446655440001",
    "createdAt": "2026-07-28T12:00:00.000Z"
  }
}
```

**Error Responses:**

**404 - Receiver Not Found:**
```json
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}
```

**409 - Already Friends:**
```json
{
  "statusCode": 409,
  "message": "Already friends",
  "error": "Conflict"
}
```

**409 - Request Already Sent:**
```json
{
  "statusCode": 409,
  "message": "Friend request already sent",
  "error": "Conflict"
}
```

**Example (curl):**
```bash
curl -X POST http://localhost:4000/api/v1/friends/request \
  -H "Authorization: Bearer your-access-token" \
  -H "Content-Type: application/json" \
  -d '{
    "receiverId": "550e8400-e29b-41d4-a716-446655440001"
  }'
```

---

### Accept Friend Request

Accept a received friend request.

```http
POST /api/v1/friends/request/:id/accept
```

**Path Parameters:**
- `id` - Friend request ID (UUID)

**Authentication:** Required (Bearer token)

**Success Response (200):**
```json
{
  "message": "Friend request accepted",
  "friendship": {
    "id": "770e8400-e29b-41d4-a716-446655440005",
    "user1Id": "550e8400-e29b-41d4-a716-446655440000",
    "user2Id": "550e8400-e29b-41d4-a716-446655440001",
    "createdAt": "2026-07-28T12:05:00.000Z"
  }
}
```

**Error Responses:**

**404 - Request Not Found:**
```json
{
  "statusCode": 404,
  "message": "Friend request not found",
  "error": "Not Found"
}
```

**400 - Already Processed:**
```json
{
  "statusCode": 400,
  "message": "Friend request already processed",
  "error": "Bad Request"
}
```

**Example (curl):**
```bash
curl -X POST http://localhost:4000/api/v1/friends/request/660e8400-e29b-41d4-a716-446655440003/accept \
  -H "Authorization: Bearer your-access-token"
```

---

### Reject Friend Request

Reject a received friend request.

```http
POST /api/v1/friends/request/:id/reject
```

**Path Parameters:**
- `id` - Friend request ID (UUID)

**Authentication:** Required (Bearer token)

**Success Response (200):**
```json
{
  "message": "Friend request rejected"
}
```

**Error Responses:**

**404 - Request Not Found:**
```json
{
  "statusCode": 404,
  "message": "Friend request not found",
  "error": "Not Found"
}
```

**400 - Already Processed:**
```json
{
  "statusCode": 400,
  "message": "Friend request already processed",
  "error": "Bad Request"
}
```

**Example (curl):**
```bash
curl -X POST http://localhost:4000/api/v1/friends/request/660e8400-e29b-41d4-a716-446655440003/reject \
  -H "Authorization: Bearer your-access-token"
```

---

### Get Friend List

Retrieve list of accepted friends.

```http
GET /api/v1/friends
```

**Authentication:** Required (Bearer token)

**Success Response (200):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "friendshipCreatedAt": "2026-07-28T12:00:00.000Z"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "name": "Bob Johnson",
    "email": "bob@example.com",
    "friendshipCreatedAt": "2026-07-28T11:00:00.000Z"
  }
]
```

**Example (curl):**
```bash
curl -X GET http://localhost:4000/api/v1/friends \
  -H "Authorization: Bearer your-access-token"
```

---

### Get Pending Received Requests

Get friend requests you've received that are still pending.

```http
GET /api/v1/friends/requests/received
```

**Authentication:** Required (Bearer token)

**Success Response (200):**
```json
[
  {
    "id": "660e8400-e29b-41d4-a716-446655440006",
    "sender": {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "name": "Alice Brown",
      "email": "alice@example.com"
    },
    "status": "PENDING",
    "createdAt": "2026-07-28T13:00:00.000Z"
  }
]
```

**Example (curl):**
```bash
curl -X GET http://localhost:4000/api/v1/friends/requests/received \
  -H "Authorization: Bearer your-access-token"
```

---

### Get Pending Sent Requests

Get friend requests you've sent that are still pending.

```http
GET /api/v1/friends/requests/sent
```

**Authentication:** Required (Bearer token)

**Success Response (200):**
```json
[
  {
    "id": "660e8400-e29b-41d4-a716-446655440007",
    "receiver": {
      "id": "550e8400-e29b-41d4-a716-446655440004",
      "name": "Charlie Davis",
      "email": "charlie@example.com"
    },
    "status": "PENDING",
    "createdAt": "2026-07-28T14:00:00.000Z"
  }
]
```

**Example (curl):**
```bash
curl -X GET http://localhost:4000/api/v1/friends/requests/sent \
  -H "Authorization: Bearer your-access-token"
```

---

### Remove Friend

Remove an existing friendship.

```http
DELETE /api/v1/friends/:friendId
```

**Path Parameters:**
- `friendId` - User ID of the friend to remove

**Authentication:** Required (Bearer token)

**Success Response (200):**
```json
{
  "message": "Friend removed successfully"
}
```

**Error Responses:**

**404 - Friendship Not Found:**
```json
{
  "statusCode": 404,
  "message": "Friendship not found",
  "error": "Not Found"
}
```

**Example (curl):**
```bash
curl -X DELETE http://localhost:4000/api/v1/friends/550e8400-e29b-41d4-a716-446655440001 \
  -H "Authorization: Bearer your-access-token"
```

---

## Chat Endpoints

### Send Message (REST)

Send a message to a friend via REST API.

```http
POST /api/v1/chat/messages
```

**Request Body:**
```json
{
  "receiverId": "550e8400-e29b-41d4-a716-446655440001",
  "content": "Hey! How are you?"
}
```

**Validation Rules:**
- `receiverId` - Required, valid UUID
- `content` - Required, non-empty string

**Authentication:** Required (Bearer token)

**Success Response (201):**
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440008",
  "senderId": "550e8400-e29b-41d4-a716-446655440000",
  "receiverId": "550e8400-e29b-41d4-a716-446655440001",
  "content": "Hey! How are you?",
  "createdAt": "2026-07-28T15:00:00.000Z",
  "sender": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**

**403 - Not Friends:**
```json
{
  "statusCode": 403,
  "message": "Can only chat with friends",
  "error": "Forbidden"
}
```

**Example (curl):**
```bash
curl -X POST http://localhost:4000/api/v1/chat/messages \
  -H "Authorization: Bearer your-access-token" \
  -H "Content-Type: application/json" \
  -d '{
    "receiverId": "550e8400-e29b-41d4-a716-446655440001",
    "content": "Hey! How are you?"
  }'
```

---

### Get Conversation

Retrieve message history with a specific user.

```http
GET /api/v1/chat/conversation/:userId
```

**Path Parameters:**
- `userId` - User ID to get conversation with

**Query Parameters:**
- `limit` (optional) - Max messages to return (default: 50)

**Authentication:** Required (Bearer token)

**Success Response (200):**
```json
[
  {
    "id": "880e8400-e29b-41d4-a716-446655440009",
    "senderId": "550e8400-e29b-41d4-a716-446655440001",
    "receiverId": "550e8400-e29b-41d4-a716-446655440000",
    "content": "I'm doing great! Thanks for asking.",
    "createdAt": "2026-07-28T15:05:00.000Z",
    "sender": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Jane Smith",
      "email": "jane@example.com"
    }
  },
  {
    "id": "880e8400-e29b-41d4-a716-446655440008",
    "senderId": "550e8400-e29b-41d4-a716-446655440000",
    "receiverId": "550e8400-e29b-41d4-a716-446655440001",
    "content": "Hey! How are you?",
    "createdAt": "2026-07-28T15:00:00.000Z",
    "sender": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
]
```

**Notes:**
- Messages ordered by most recent first
- Includes both sent and received messages in the conversation

**Error Responses:**

**403 - Not Friends:**
```json
{
  "statusCode": 403,
  "message": "Can only view messages with friends",
  "error": "Forbidden"
}
```

**Example (curl):**
```bash
# Default limit (50 messages)
curl -X GET http://localhost:4000/api/v1/chat/conversation/550e8400-e29b-41d4-a716-446655440001 \
  -H "Authorization: Bearer your-access-token"

# Custom limit
curl -X GET "http://localhost:4000/api/v1/chat/conversation/550e8400-e29b-41d4-a716-446655440001?limit=100" \
  -H "Authorization: Bearer your-access-token"
```

---

## WebSocket API

Real-time chat using Socket.io.

### Connection

**Namespace:** `/chat`

**URL:** `http://localhost:4000/chat`

**Authentication:** JWT token in handshake

**Connect (JavaScript):**
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000/chat', {
  auth: {
    token: 'your-jwt-access-token'
  }
});

socket.on('connect', () => {
  console.log('Connected:', socket.id);
});

socket.on('disconnect', () => {
  console.log('Disconnected');
});
```

**Connection Lifecycle:**

1. Client connects with JWT in `auth.token` or `query.token`
2. Server validates token
3. If valid: Connection accepted, userId stored
4. If invalid: Connection rejected

---

### Send Message

**Event:** `message`

**Direction:** Client → Server

**Payload:**
```json
{
  "receiverId": "550e8400-e29b-41d4-a716-446655440001",
  "content": "Hello from WebSocket!"
}
```

**Response:**
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440010",
  "senderId": "550e8400-e29b-41d4-a716-446655440000",
  "receiverId": "550e8400-e29b-41d4-a716-446655440001",
  "content": "Hello from WebSocket!",
  "createdAt": "2026-07-28T15:10:00.000Z",
  "sender": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Example (JavaScript):**
```javascript
socket.emit('message', {
  receiverId: '550e8400-e29b-41d4-a716-446655440001',
  content: 'Hello from WebSocket!'
}, (response) => {
  console.log('Message sent:', response);
});
```

---

### Receive Message

**Event:** `message`

**Direction:** Server → Client

**Payload:**
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440011",
  "senderId": "550e8400-e29b-41d4-a716-446655440001",
  "receiverId": "550e8400-e29b-41d4-a716-446655440000",
  "content": "Hi! Received your message.",
  "createdAt": "2026-07-28T15:15:00.000Z",
  "sender": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Jane Smith",
    "email": "jane@example.com"
  }
}
```

**Example (JavaScript):**
```javascript
socket.on('message', (message) => {
  console.log('New message:', message);
  // Update UI with new message
});
```

---

### Full WebSocket Example

```javascript
import { io } from 'socket.io-client';

const accessToken = 'your-jwt-access-token';

const socket = io('http://localhost:4000/chat', {
  auth: { token: accessToken }
});

// Connection events
socket.on('connect', () => {
  console.log('Connected to chat server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from chat server');
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);
});

// Send message
function sendMessage(receiverId, content) {
  socket.emit('message', { receiverId, content }, (response) => {
    console.log('Message sent:', response);
  });
}

// Receive messages
socket.on('message', (message) => {
  console.log('Received message:', message);
  displayMessage(message);
});

// Example usage
sendMessage('550e8400-e29b-41d4-a716-446655440001', 'Hello!');
```

---

## Rate Limiting

**Current Status:** Not implemented (open API)

**Production Recommendation:**

Add rate limiting using `@nestjs/throttler`:

```typescript
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 100, // 100 requests per minute
    }),
  ],
})
```

**Recommended Limits:**

| Endpoint Type | Limit |
|---------------|-------|
| Authentication | 10 requests/minute |
| Read operations | 100 requests/minute |
| Write operations | 50 requests/minute |
| WebSocket messages | 30 messages/minute per conversation |

---

## Example Clients

### JavaScript/TypeScript Client

```typescript
import axios from 'axios';
import { io } from 'socket.io-client';

const API_BASE = 'http://localhost:4000/api/v1';

class NestConnectClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private socket: any = null;

  // Authentication
  async signUp(name: string, email: string, password: string) {
    const response = await axios.post(`${API_BASE}/auth/signup`, {
      name, email, password
    });
    this.accessToken = response.data.accessToken;
    this.refreshToken = response.data.refreshToken;
    return response.data;
  }

  async signIn(email: string, password: string) {
    const response = await axios.post(`${API_BASE}/auth/signin`, {
      email, password
    });
    this.accessToken = response.data.accessToken;
    this.refreshToken = response.data.refreshToken;
    return response.data;
  }

  // Users
  async getUsers(search?: string) {
    const response = await axios.get(`${API_BASE}/users`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
      params: { search }
    });
    return response.data;
  }

  // Friends
  async sendFriendRequest(receiverId: string) {
    const response = await axios.post(
      `${API_BASE}/friends/request`,
      { receiverId },
      { headers: { Authorization: `Bearer ${this.accessToken}` } }
    );
    return response.data;
  }

  async getFriends() {
    const response = await axios.get(`${API_BASE}/friends`, {
      headers: { Authorization: `Bearer ${this.accessToken}` }
    });
    return response.data;
  }

  // Chat (REST)
  async sendMessage(receiverId: string, content: string) {
    const response = await axios.post(
      `${API_BASE}/chat/messages`,
      { receiverId, content },
      { headers: { Authorization: `Bearer ${this.accessToken}` } }
    );
    return response.data;
  }

  async getConversation(userId: string, limit = 50) {
    const response = await axios.get(
      `${API_BASE}/chat/conversation/${userId}`,
      {
        headers: { Authorization: `Bearer ${this.accessToken}` },
        params: { limit }
      }
    );
    return response.data;
  }

  // WebSocket
  connectChat(onMessage: (message: any) => void) {
    this.socket = io('http://localhost:4000/chat', {
      auth: { token: this.accessToken }
    });

    this.socket.on('connect', () => {
      console.log('Chat connected');
    });

    this.socket.on('message', onMessage);

    return this.socket;
  }

  sendChatMessage(receiverId: string, content: string) {
    return new Promise((resolve) => {
      this.socket.emit('message', { receiverId, content }, resolve);
    });
  }
}

// Usage
const client = new NestConnectClient();

await client.signIn('john@example.com', 'password123');
const friends = await client.getFriends();
console.log('Friends:', friends);

client.connectChat((message) => {
  console.log('New message:', message);
});

await client.sendChatMessage(friends[0].id, 'Hello!');
```

---

### Python Client

```python
import requests
import socketio

API_BASE = 'http://localhost:4000/api/v1'

class NestConnectClient:
    def __init__(self):
        self.access_token = None
        self.refresh_token = None
        self.sio = socketio.Client()

    def sign_in(self, email, password):
        response = requests.post(f'{API_BASE}/auth/signin', json={
            'email': email,
            'password': password
        })
        data = response.json()
        self.access_token = data['accessToken']
        self.refresh_token = data['refreshToken']
        return data

    def get_friends(self):
        response = requests.get(f'{API_BASE}/friends', headers={
            'Authorization': f'Bearer {self.access_token}'
        })
        return response.json()

    def send_message(self, receiver_id, content):
        response = requests.post(f'{API_BASE}/chat/messages', json={
            'receiverId': receiver_id,
            'content': content
        }, headers={
            'Authorization': f'Bearer {self.access_token}'
        })
        return response.json()

    def connect_chat(self, on_message):
        self.sio.on('message', on_message)
        self.sio.connect('http://localhost:4000/chat', auth={
            'token': self.access_token
        }, namespaces=['/chat'])

    def send_chat_message(self, receiver_id, content):
        self.sio.emit('message', {
            'receiverId': receiver_id,
            'content': content
        }, namespace='/chat')

# Usage
client = NestConnectClient()
client.sign_in('john@example.com', 'password123')
friends = client.get_friends()
print('Friends:', friends)

def on_message(message):
    print('New message:', message)

client.connect_chat(on_message)
client.send_chat_message(friends[0]['id'], 'Hello!')
```

---

## Next Steps

- **Architecture:** See [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
- **Database:** See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for data model
- **Authentication:** See [Authentication Guide](../security/AUTHENTICATION.md) for auth details
- **Deployment:** See [Deployment Guides](../deployment/) for production setup

---

**Last Updated:** 2026-07-28
**API Version:** 1.0
