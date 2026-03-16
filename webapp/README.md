# Get2u Errand — On-Demand Pickup & Errand Service

An on-demand errand service platform connecting customers with trusted agents who handle deliveries, car services, and more.

## Features

### Customer Side
- **Send Mail** — Request an agent to send letters/mail to courier offices
- **Send Package** — Package pickup and delivery via DHL, FedEx, UPS, USPS, or local couriers
- **Pickup & Drop-off** — General pickup and drop-off errand service
- **Car Wash** — On-location car wash service
- **Fueling** — Car fueling service
- **Oil Change** — Vehicle oil change assistance
- **Vehicle Help** — General vehicle assistance (battery jump, tire inflation, etc.)
- **Order Tracking** — Real-time status tracking with progress timeline
- **Vehicle Management** — Save and manage multiple vehicles
- **Order History** — View all past and active orders with filters

### Agent Side
- **Available Jobs** — Browse and accept pending job requests
- **Job Management** — Start, track, and complete accepted jobs
- **Earnings Dashboard** — Track completed jobs and earnings
- **Role Switching** — Switch between customer and agent modes

### Authentication
- Email OTP login (passwordless)
- Automatic account creation for new users
- Role-based access (customer, agent, admin)

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend**: Bun, Hono, Prisma (SQLite), Better Auth
- **Auth**: Email OTP via Better Auth + Vibecode SDK

## Pages

| Route | Description |
|-------|-------------|
| `/login` | Email login page |
| `/verify-otp` | OTP verification |
| `/dashboard` | Customer home with quick actions and recent orders |
| `/new-request` | Create new delivery or car service request |
| `/orders` | Order history with filters |
| `/orders/:id` | Order detail with status timeline |
| `/profile` | User profile, vehicles, role management |
| `/agent` | Agent dashboard with available jobs |
| `/agent/my-jobs` | Agent's accepted and completed jobs |
| `/agent/earnings` | Agent earnings overview |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | List orders (role-filtered) |
| POST | `/api/orders` | Create new order |
| GET | `/api/orders/:id` | Get order details |
| PATCH | `/api/orders/:id/status` | Update order status |
| PATCH | `/api/orders/:id/accept` | Agent accepts an order |
| GET | `/api/vehicles` | List user's vehicles |
| POST | `/api/vehicles` | Add a vehicle |
| DELETE | `/api/vehicles/:id` | Remove a vehicle |
| GET | `/api/me` | Get current user profile |
| PATCH | `/api/me` | Update profile |
| PATCH | `/api/me/role` | Switch user role |
