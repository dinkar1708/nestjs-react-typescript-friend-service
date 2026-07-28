# NestConnect

**Project:** nestjs-react-typescript-friend-service

Social networking and chat app – users, friends, real-time messaging.

## Tech Stack

NestJS + React (Vite) + Flutter (Option #6 from trending architectures below)

### Backend API
- **Framework:** NestJS v11
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma v5
- **Authentication:** JWT with Passport
- **Real-time:** WebSockets (Socket.io)
- **API Documentation:** Swagger
- **Validation:** class-validator & class-transformer
- **Security:** bcrypt for password hashing
- **SEO:** N/A (Backend only - but can serve data to any SEO-capable frontend)

### Web Frontend
- **Framework:** React v19
- **Language:** TypeScript
- **Build Tool:** Vite v7
- **Linting:** ESLint
- **SEO:** No SSR (Client-side only) - Not suitable for content-heavy/SEO-critical apps
  - *To achieve SEO:* Migrate to Next.js (SSR/SSG), use Remix, or implement react-snap for pre-rendering

### Mobile (Planned)
- **Framework:** Flutter
- **Language:** Dart
- **SEO:** N/A (Mobile apps don't use traditional SEO)
  - *For discoverability:* Focus on App Store Optimization (ASO) - keywords, screenshots, reviews

# DEMO

<img width="1330" height="887" alt="Screenshot 2026-07-12 at 15 29 11" src="https://github.com/user-attachments/assets/d23268e1-5b53-452e-ae91-91925bfc9b20" />
<img width="1196" height="1008" alt="Screenshot 2026-07-12 at 15 28 58" src="https://github.com/user-attachments/assets/3d30be0f-d419-4b8a-b4dc-24bf19aa7496" />
<img width="973" height="710" alt="Screenshot 2026-07-12 at 15 29 20" src="https://github.com/user-attachments/assets/0229e438-919e-4f01-8514-eac13ee832e2" />


## Project Structure

| Folder | Description |
|--------|--------------|
| `backend-api/` | NestJS API (auth, users, friends, chat) |
| `web/` | React frontend |
| `mobile/` | Mobile app (planned) |

## Quick Start

**Backend API:** See [docs/getting-started/backend.md](docs/getting-started/backend.md)

**Web UI:** See [docs/interfaces/web/README.md](docs/interfaces/web/README.md)

**Mobile:** See [docs/interfaces/mobile/README.md](docs/interfaces/mobile/README.md)

**Backend tests:** `cd backend-api && npm test && npm run test:e2e` — 2 unit + 15 e2e (auth, users, friends, chat)

## Features

| Feature | Status | Documentation |
|---------|--------|---------------|
| **Authentication** | Backend + Web | [docs/features/authentication.md](docs/features/authentication.md) |
| **Users** | Backend only | [docs/features/users.md](docs/features/users.md) |
| **Friends** | Backend only | [docs/features/friends.md](docs/features/friends.md) |
| **Chat** | Backend only | [docs/features/chat.md](docs/features/chat.md) |
| **WebRTC Demo** | Web only | [docs/features/webrtc-demo.md](docs/features/webrtc-demo.md) |

Full feature documentation: [docs/features/README.md](docs/features/README.md)

## Documentation

| Category | Documentation |
|----------|---------------|
| **Getting Started** | [Backend Setup](docs/getting-started/backend.md) |
| **Features** | [All Features](docs/features/README.md) |
| **Architecture** | [System Architecture](docs/core/architecture/ARCHITECTURE.md) |
| **API** | [API Documentation](docs/core/architecture/API.md) |
| **Database** | [Database Schema](docs/core/architecture/DATABASE_SCHEMA.md) |
| **Security** | [Security & Best Practices](docs/core/security/README.md) |
| **WebRTC Demo** | [WebRTC Implementation](docs/WEBRTC_DEMO.md) |
| **References** | [Additional Resources](docs/REFERENCES.md) |

## Why This Stack?

**NestJS + React (Vite) + Flutter** - Option #6 from trending architectures

**Perfect for:**
* Real-time chat applications (Slack, Discord-like)
* Social networking platforms (Instagram, Twitter-like)
* Live collaboration tools
* Any app where real-time features > SEO

**Key strengths:**
* Enterprise-grade backend with native WebSocket support
* Fast SPA development with Vite (no SSR needed for authenticated apps)
* High-performance cross-platform mobile with Flutter
* Full type safety (TypeScript + Dart)

**See full comparison of 7 trending architectures in the appendix below.**

---

## Contributing

See improvement suggestions and best practices compliance in:
- [outputs/improvement-plan.md](outputs/improvement-plan.md) - Comprehensive improvement roadmap
- [docs/BEST_PRACTICES_COMPLIANCE.md](docs/BEST_PRACTICES_COMPLIANCE.md) - Current compliance status

---

# Appendix: Trending Full-Stack Architectures (2026)

<details>
<summary>Click to expand - Comparison of 7 modern full-stack architectures</summary>

## 1. NestJS + Next.js + Flutter

**Languages:** TypeScript, Dart
**Frameworks:** NestJS + Next.js + Flutter

**Why trending**

* Enterprise-grade backend
* SSR + SEO from Next.js
* Flutter strong for cross-platform apps
* Type-safe architecture

**SEO:** Excellent (Next.js SSR/SSG)

**Best for these app types:**

* E-commerce platforms (product pages need SEO)
* SaaS products (marketing + app functionality)
* Content marketplaces (blogs, courses, listings)
* Job boards / Real estate portals
* B2B enterprise dashboards with public pages
* Any app requiring strong SEO + mobile presence

**One of the best modern stacks**

---

## 2. NestJS + React + React Native

**Languages:** TypeScript only
**Frameworks:** NestJS + React + React Native

**Why trending**

* **Single language (TypeScript)**
* Shared types between backend + frontend
* Huge developer ecosystem

**SEO:** Depends on setup (CSR = No SEO, SSR frameworks like Remix/Next.js = Good SEO)

**Best for these app types:**

* Internal business tools / Admin panels
* Productivity apps (task managers, note apps)
* Fitness / Health tracking apps
* Restaurant / Food delivery apps
* Simple social networking apps
* Startups needing rapid MVP with web + mobile

**Weakness**

* React Native performance sometimes behind Flutter

**Very popular for startups**

---

## 3. FastAPI + React + Flutter

**Languages:** Python, TypeScript, Dart
**Frameworks:** FastAPI + React + Flutter

**Why trending**

* FastAPI exploding in popularity
* Great for **AI + ML APIs**
* Async performance very good

**SEO:** Depends on React setup (CSR = No SEO, SSR = Good SEO)

**Best for these app types:**

* AI-powered applications (ChatGPT-like, image generation)
* Machine learning platforms
* Data analytics dashboards
* Computer vision apps
* Recommendation systems
* IoT platforms with data processing
* Scientific/research applications

**Good for AI or data products**

---

## 4. Express + Next.js + React Native

**Languages:** TypeScript
**Frameworks:** Express.js + Next.js + React Native

**Why used**

* Simple and flexible
* Massive ecosystem

**SEO:** Excellent (Next.js SSR/SSG)

**Best for these app types:**

* Startup MVPs (fastest to market)
* Blogs / Content sites
* Landing pages + marketing sites
* Small to medium e-commerce
* Portfolio / Agency websites
* Event booking platforms
* Simple SaaS products

**But**

* Less structured than NestJS
* Large apps become messy

**Good for MVP/startups**

---

## 5. Django + React + Flutter

**Languages:** Python, TypeScript, Dart
**Frameworks:** Django + React + Flutter

**Why used**

* Very mature
* Secure
* Great admin panel

**SEO:** Depends on React setup (CSR = No SEO, Django templates/SSR = Good SEO)

**Best for these app types:**

* Government / Enterprise systems (security critical)
* Healthcare platforms (HIPAA compliance)
* Financial applications (banking, fintech)
* Educational platforms (LMS, course sites)
* Content management systems
* News / Media platforms
* Large-scale data-driven apps

**Weakness**

* Less modern developer experience compared to NestJS/FastAPI

---

## 6. NestJS + React (Vite) + Flutter

**Languages:** TypeScript, Dart
**Frameworks:** NestJS + React + Vite + Flutter

**Why trending**

* Enterprise-grade backend with NestJS
* Fast development with Vite (faster than CRA/Next.js for SPAs)
* Flutter for high-performance mobile
* Full TypeScript on backend + web
* Great for real-time apps (chat, social)

**SEO:** No SSR (Client-side SPA only) - Not for content/marketing sites

**Best for these app types:**

* Real-time chat applications (Slack, Discord-like)
* Social networking platforms (Instagram, Twitter-like)
* Live collaboration tools (Figma, Miro-like)
* Real-time dashboards / Analytics platforms
* Trading platforms (stocks, crypto)
* Gaming platforms / Multiplayer lobbies
* Video conferencing apps
* Project management tools (Trello, Asana-like)

**Perfect for non-SEO focused apps needing real-time features**

---

## 7. Next.js Full-Stack + Flutter

**Languages:** TypeScript, Dart
**Frameworks:** Next.js (Frontend + API) + Flutter

**Why trending**

* Single codebase for web frontend and API
* Built-in SSR/SSG for excellent SEO
* API Routes for backend logic
* Fast development and deployment
* Vercel-optimized
* Type-safe full-stack TypeScript

**SEO:** Excellent (Next.js SSR/SSG built-in)

**Best for these app types:**

* E-commerce platforms (Shopify-like)
* Food delivery / Restaurant platforms (Uber Eats-like)
* Service marketplaces (Upwork, Fiverr-like)
* Job boards (Indeed, LinkedIn Jobs-like)
* Real estate platforms (Zillow-like)
* Course/learning platforms (Udemy-like)
* Event booking platforms
* Healthcare appointment booking
* Travel/hotel booking sites

**Pros:**
* Fastest to MVP (single codebase)
* SEO out of the box
* Easy Vercel deployment
* Less complex architecture

**Cons:**
* Next.js API routes less powerful for complex backends
* WebSocket support requires external service (Pusher, Ably) or separate server
* Harder to scale API independently
* Not ideal for heavy real-time features

**Perfect for SEO-critical apps with moderate backend complexity**

---

## Bonus: tRPC Stack (very trending)

**Stack**

* tRPC
* Next.js
* React Native

**Why popular:**

* **End-to-end type safety**
* No REST API layer
* Very productive for startups

---

## Top 3 Most Trending (2026)

1. **NestJS + Next.js + Flutter**
2. **NestJS + React + React Native**
3. **FastAPI + React + Flutter**

</details>

---
