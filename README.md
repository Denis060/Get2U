# Get2U

A service marketplace app where customers can request deliveries and car services, and agents fulfill those requests. Includes an admin panel to manage everything.

---

## What the App Does

- **Customers** can place delivery or car service requests
- **Agents** accept and fulfill orders, with location tracking
- **Admins** manage users, orders, and agents
- Real-time messaging between customers and agents per order
- OTP-based phone/email authentication

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite + TailwindCSS + shadcn/ui (port 8000) |
| Backend | Bun + Hono (port 3000) |
| Database | SQLite via Prisma ORM |
| Auth | Better Auth |
| Validation | Zod |

---

## Project Structure

```
/
├── webapp/          # React frontend (Vite, port 8000)
│   └── src/
│       ├── pages/   # All app pages
│       ├── components/
│       ├── hooks/
│       └── lib/
├── backend/         # Hono API server (Bun, port 3000)
│   └── src/
│       ├── routes/  # API route modules
│       ├── index.ts # App entry + middleware
│       ├── auth.ts  # Better Auth setup
│       ├── prisma.ts# Prisma client
│       ├── types.ts # Shared Zod schemas (API contracts)
│       └── env.ts   # Environment validation
│   └── prisma/
│       ├── schema.prisma
│       └── dev.db   # SQLite database file
```

---

## Pages

### Customer
- `/` — Landing page
- `/login` — Login / signup
- `/verify` — OTP verification
- `/dashboard` — Customer dashboard
- `/new-request` — Place a new order
- `/orders` — View all orders
- `/orders/:id` — Order detail + chat
- `/profile` — Profile settings
- `/pricing` — Pricing info

### Agent
- `/agent/dashboard` — Agent dashboard
- `/agent/jobs` — Available & active jobs
- `/agent/jobs/:id` — Job detail + chat
- `/agent/earnings` — Earnings overview

### Admin
- `/admin` — Admin dashboard
- `/admin/orders` — All orders
- `/admin/agents` — Manage agents
- `/admin/customers` — Manage customers
- `/admin/messages` — Message logs

---

## API Routes

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Health check |
| * | `/api/auth/*` | Auth (Better Auth) |
| GET/POST | `/api/orders` | List / create orders |
| GET/PATCH | `/api/orders/:id` | Get / update order |
| GET/POST | `/api/orders/:id/messages` | Order messages |
| GET/POST | `/api/vehicles` | List / add vehicles |
| GET/PATCH | `/api/users/me` | Current user profile |
| GET | `/api/admin/orders` | Admin: all orders |
| GET | `/api/admin/users` | Admin: all users |
| GET | `/api/admin/agents` | Admin: agents |
| PATCH | `/api/admin/agents/:id` | Admin: approve agent |

All routes return `{ data: ... }`. Auth routes are excluded.

---

## Local Setup

### Prerequisites
- [Bun](https://bun.sh) installed

### 1. Clone the repo
```bash
git clone https://github.com/Denis060/Get2U.git
cd Get2U
```

### 2. Backend setup
```bash
cd backend
cp .env.example .env   # fill in values (see below)
bun install
bunx prisma db push
bun run dev
```

### 3. Frontend setup
```bash
cd webapp
bun install
bun run dev
```

---

## Environment Variables

### `backend/.env`
```env
PORT=3000
DATABASE_URL="file:./dev.db"
BETTER_AUTH_SECRET="your-random-secret-here"
OPENAI_API_KEY="sk-..."         # Optional: for AI features
ADMIN_EMAIL=""                  # Email of the first admin user
```

### `webapp/.env`
```env
VITE_BACKEND_URL=http://localhost:3000   # Only needed in local dev
```

> In production, the frontend uses relative `/api/...` URLs automatically.

---

## Database

Schema is in `backend/prisma/schema.prisma`.

Key models: `User`, `Order`, `Vehicle`, `Message`, `AgentProfile`, `Session`, `Account`, `Verification`

To update the schema:
```bash
cd backend
bunx prisma db push          # apply changes
bunx prisma generate         # regenerate client
```

---

## User Roles

| Role | Access |
|---|---|
| `customer` | Place orders, chat with agent |
| `agent` | Accept jobs, update status, track location |
| `admin` | Full access to all data and user management |

Role is set on the `User` model. Set `ADMIN_EMAIL` in `.env` to auto-promote the first admin.
