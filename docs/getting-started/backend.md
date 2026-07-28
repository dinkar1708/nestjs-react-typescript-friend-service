# NestConnect Backend API

**Project:** nestjs-react-typescript-friend-service

NestJS API – auth, users, friends, real-time chat. Port 4000.

**Technology stack**

| Layer | Tech |
|-------|------|
| Runtime | Node.js |
| Framework | NestJS 11 |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT (Passport), bcrypt |
| Validation | class-validator, class-transformer |
| API docs | Swagger (OpenAPI) |
| Real-time | Socket.IO (@nestjs/platform-socket.io) |
| Testing | Jest, Supertest |

**Start (fresh clone — one-shot setup)**
```bash
npm install
npm run db:setup   # creates DB if missing, migrates, seeds demo user
npm run start:dev
```

The seed creates a demo login you can use immediately from the web UI:

- **Email:** `demo@nestconnect.dev`
- **Password:** `demopass123`

(In dev the web login page shows a **Fill demo login (dev)** button that
uses these credentials — no typing needed.)

Override the seeded credentials by setting `SEED_DEMO_EMAIL` /
`SEED_DEMO_PASSWORD` / `SEED_DEMO_NAME` in the environment before running
`npm run db:setup`.

Individual steps if you prefer to run them manually:

```bash
node scripts/db-setup.js               # create the database if missing
npx dotenv -e .env.dev -- prisma migrate deploy
npm run prisma:seed
```

**Stop & Restart**
```bash
# Stop: Ctrl+C in the terminal running the server
# Or kill by port:
lsof -ti:4000 | xargs kill -9

# Restart (ensure PORT from .env.dev is used):
npm run start:dev

# If port conflicts, run with explicit PORT:
PORT=4000 npm run start:dev
```

**Docker**
```bash
docker compose up -d

# Stop:
docker compose down
```

**Test**
```bash
# Signin (returns accessToken + refreshToken)
curl -X POST http://localhost:4000/api/v1/auth/signin -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Refresh token
curl -X POST http://localhost:4000/api/v1/auth/refresh-token -H "Content-Type: application/json" \
  -d '{"refreshToken":"<your-refresh-token>"}'
```

Swagger: `http://localhost:4000/api`
