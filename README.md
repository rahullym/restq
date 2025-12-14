# RESq - Restaurant Queue Management System

A production-ready web application for managing restaurant queues. Customers scan a QR code to join the queue, and restaurant staff manage entries through an admin dashboard.

## Tech Stack

- **Frontend**: Next.js 14+ with App Router, React Server Components
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes (Route Handlers) with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with credentials provider
- **State Management**: React Server Actions + React Query
- **Deployment**: Vercel-ready with managed PostgreSQL (Neon/Supabase/Railway)

## Features

### Customer Features
- QR code-based queue entry
- Real-time queue position and wait time estimates
- Mobile-first responsive design
- Auto-refreshing status page

### Admin Features
- Protected admin dashboard
- Live queue management
- Call next customer functionality
- Status management (Waiting, Called, Seated, No-show, Cancelled)
- Queue analytics
- Settings management
- Clear completed entries

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- PostgreSQL database (local or managed)
- Environment variables configured

## Local Development Setup

### 1. Clone and Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/resq?schema=public"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Node Environment
NODE_ENV="development"
```

**Important**: Generate a secure `NEXTAUTH_SECRET` for production:
```bash
openssl rand -base64 32
```

### 3. Set Up Database

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database (for development)
npm run db:push

# Or create a migration (for production)
npm run db:migrate
```

### 4. Seed the Database

```bash
npm run db:seed
```

This creates:
- Demo restaurant with slug `demo-restaurant`
- Admin user:
  - Email: `admin@example.com`
  - Password: `Admin@123`

### 5. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
RESq/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Database seeding script
├── src/
│   ├── app/
│   │   ├── (public)/          # Public customer-facing routes
│   │   │   └── [restaurantSlug]/
│   │   ├── (admin)/           # Protected admin routes
│   │   │   └── admin/
│   │   └── api/               # API route handlers
│   ├── components/
│   │   ├── customer/          # Customer-facing components
│   │   └── admin/             # Admin panel components
│   ├── lib/                   # Utility functions
│   └── types/                 # TypeScript type definitions
├── tests/                     # Test files
└── README.md
```

## Database Migrations

### Create a Migration

```bash
npm run db:migrate
```

This will:
1. Create a new migration file
2. Apply it to your database
3. Regenerate Prisma Client

### Apply Migrations (Production)

```bash
npx prisma migrate deploy
```

### View Database (Prisma Studio)

```bash
npm run db:studio
```

## API Documentation

### Public Endpoints

#### Create Queue Entry
```
POST /api/public/[restaurantSlug]/queue
Body: {
  name: string (required)
  mobileNumber: string (required, E.164 format)
  partySize?: number (optional, default: 2)
  seatingType?: "Indoor" | "Outdoor" | "Any" (optional)
}
```

#### Get Queue Status
```
GET /api/public/[restaurantSlug]/queue-status?entryId=<entryId>
```

### Admin Endpoints (Authenticated)

#### Get Queue List
```
GET /api/admin/[restaurantId]/queue
```

#### Call Next Customer
```
POST /api/admin/[restaurantId]/queue/call-next
```

#### Update Entry Status
```
POST /api/admin/[restaurantId]/queue/[entryId]
Body: {
  status: "WAITING" | "CALLED" | "SEATED" | "NO_SHOW" | "CANCELLED"
}
```

#### Update Settings
```
POST /api/admin/[restaurantId]/settings
Body: {
  averageMinutesPerParty: number (1-60)
}
```

#### Clear Completed Entries
```
POST /api/admin/[restaurantId]/queue/clear-completed
```

## Usage

### Customer Flow

1. Customer scans QR code pointing to `https://your-domain.com/{restaurantSlug}`
2. Customer fills out the queue entry form
3. Receives a token number and estimated wait time
4. Can check status on the success page (auto-refreshes every 30 seconds)

### Admin Flow

1. Navigate to `/admin/login`
2. Login with admin credentials
3. View queue dashboard at `/admin/dashboard`
4. Use "Call Next Customer" to mark the next waiting customer as called
5. Update individual entry statuses as needed
6. View analytics at `/admin/analytics`
7. Configure settings at `/admin/settings`

## Testing

Run tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## Deployment

### Render Deployment (Free Tier) - Recommended

**Quick Start**: See [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) for detailed instructions.

**Summary**:
1. Push code to GitHub
2. **Set up Supabase database** (see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md))
3. Create Web Service on Render (free tier)
4. Set environment variables:
   - `DATABASE_URL` (use Supabase Direct connection string - port 5432)
   - `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`)
   - `NEXTAUTH_URL` (your Render app URL)
5. Run migrations: `npx prisma migrate deploy`
6. Seed database: `npm run db:seed`

**Render Configuration**: The project includes `render.yaml` for automatic setup.

**Database**: We use **Supabase** instead of Render's PostgreSQL for better free tier limits (500 MB vs 1 GB, better performance).

### Vercel Deployment

1. Push your code to GitHub/GitLab/Bitbucket
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Set up PostgreSQL database (Neon, Supabase, or Railway)
5. Update `DATABASE_URL` in Vercel environment variables
6. Deploy

### Database Setup for Production

#### Option 1: Supabase (Recommended) ⭐
- **Free Tier**: 500 MB database, 2 GB bandwidth, unlimited API requests
- **Easy Setup**: Simple dashboard and connection strings
- **Better Performance**: Optimized PostgreSQL
- See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed setup guide

#### Option 2: Neon (Alternative)
1. Create account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Add to environment variables

#### Option 3: Supabase
1. Create account at [supabase.com](https://supabase.com)
2. Create a new project
3. Get connection string from Settings > Database
4. Add to environment variables

#### Option 4: Railway
1. Create account at [railway.app](https://railway.app)
2. Create a new PostgreSQL service
3. Copy the connection string
4. Add to environment variables

### Post-Deployment Steps

1. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

2. Seed the database (optional):
   ```bash
   npm run db:seed
   ```

3. Update `NEXTAUTH_URL` to your production domain

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_SECRET` | Secret for JWT signing | Yes |
| `NEXTAUTH_URL` | Your app URL | Yes |
| `NODE_ENV` | Environment (development/production) | Yes |
| `NOTIFICATION_PROVIDER` | Notification service (default: "mock") | No |

## Security Considerations

- Passwords are hashed using bcryptjs
- SQL injection prevention via Prisma ORM
- CSRF protection via NextAuth
- Input validation on all endpoints using Zod
- Authentication required for admin routes
- Rate limiting should be configured in production (consider Vercel's built-in rate limiting or middleware)

## Notification Service

The application includes a notification service abstraction. Currently, it uses a mock service that logs to the console. To integrate real notifications:

1. Update `src/lib/notifications.ts` with your provider
2. Set `NOTIFICATION_PROVIDER` environment variable
3. Add provider-specific environment variables (e.g., Twilio credentials)

Supported providers (can be extended):
- Mock (default)
- Twilio SMS (to be implemented)
- WhatsApp Business API (to be implemented)

## Multi-Restaurant Support

The system is designed to support multiple restaurants:
- Each restaurant has a unique slug
- Users can be linked to multiple restaurants
- Queue entries are scoped to restaurants
- Admin dashboard shows the first restaurant (can be extended to support selection)

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check database is accessible from your network
- Ensure SSL is configured if required

### Authentication Issues
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- Clear browser cookies and try again

### Build Errors
- Run `npx prisma generate` before building
- Ensure all environment variables are set
- Check TypeScript errors: `npm run lint`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please open an issue on GitHub.


