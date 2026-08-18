# Realtime Chat

A full-stack chat application with direct and group messaging, live delivery, presence, typing indicators, unread counts, and paginated history. Built with a Nest.js backend over WebSockets and a Next.js client.

## Features

- Email and password auth with JWT access tokens and rotating refresh tokens
- Reuse detection that revokes a token family when a used refresh token is replayed
- Direct rooms between two users and named group rooms
- Live message delivery over WebSockets
- Presence that reflects connect and disconnect within a second
- Typing indicators scoped to a room
- Unread counts per room, cleared when the room is opened
- Message history with cursor pagination

## Tech stack

| Layer | Choice |
|-------|--------|
| Frontend | Next.js App Router, TypeScript, Tailwind CSS, socket.io-client |
| Backend | Nest.js, socket.io gateway, REST for non-realtime |
| Database | PostgreSQL via TypeORM |
| Auth | JWT access and refresh with rotation |
| Tests | Jest, React Testing Library |

## Architecture

The project is split into `fe` and `be`. Both use a feature-based layout where each feature owns its own controllers, services, entities, and tests.

```
be/src/features    auth, users, rooms, messages, realtime, health
fe/src/features     auth, chat
```

PostgreSQL is the source of truth. REST handles auth, users, rooms, and history. The socket.io gateway handles live messages, presence, and typing. See `PLAN/architecture.md` for the data model and event contracts.

## Running with Docker

Requires Docker and Docker Compose.

```
cp .env.example .env
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:4000/api
- Postgres: localhost:5432

## Local development

Backend:

```
cd be
cp .env.example .env
npm install
npm run start:dev
```

Frontend:

```
cd fe
cp .env.example .env
npm install
npm run dev
```

## Tests

```
cd be && npm test
cd fe && npm test
```

## Test accounts

| Username | Email | Password |
|----------|-------|----------|
| user1 | user1@gmail.com | 12345678 |
| user2 | user2@gmail.com | 12345678 |

## API summary

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/register | Create an account, returns a token pair |
| POST | /api/auth/login | Authenticate, returns a token pair |
| POST | /api/auth/refresh | Rotate the refresh token |
| GET | /api/users/me | Current profile |
| PUT | /api/users/me | Update display name |
| GET | /api/users/contacts | Other users |
| POST | /api/rooms | Create a direct or group room |
| GET | /api/rooms | Rooms for the current user |
| POST | /api/rooms/:id/join | Join a group room |
| POST | /api/rooms/:id/leave | Leave a room |
| POST | /api/rooms/:roomId/messages | Send a message |
| GET | /api/rooms/:roomId/messages | Paginated history |
| POST | /api/rooms/:roomId/messages/read | Mark a message read |

## WebSocket events

| Direction | Event | Payload |
|-----------|-------|---------|
| Client to server | message:send | roomId, body |
| Client to server | typing:start, typing:stop | roomId |
| Server to client | message:new | message |
| Server to client | presence:update | userId, online |
| Server to client | typing:update | roomId, userId, typing |
