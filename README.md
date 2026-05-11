# College-vrs

College-vrs is a vehicle rental platform for bikes and scooters. It lets customers discover vehicles, check availability, book rides, pay online, leave reviews, and manage trips, while hosts can create and manage listings from a dedicated dashboard.

## Features

- Public landing page with featured vehicles and platform highlights
- Search and filtering for vehicles by type, availability, and pricing
- Booking flow with rental date validation and pricing calculations
- Online payment support through Khalti
- Email notifications for account and booking events through Resend
- Auth.js authentication with credentials-based sign in
- User profile, trip history, account settings, and password recovery
- Hosting dashboard for listing management, bookings, and analytics
- Review system for completed rentals
- Admin and host-focused analytics charts and summaries

## Tech Stack

- Next.js 16 with the App Router
- React 19
- TypeScript
- Prisma ORM with PostgreSQL
- NextAuth/Auth.js
- Tailwind CSS 4
- shadcn/ui and Radix UI components
- Recharts for dashboard visualizations
- Framer Motion for motion effects
- Resend for email delivery
- Khalti for payments

## Project Structure

- `app/(public)` contains the public pages such as home, login, signup, search, booking, profile, trips, and account settings
- `app/hosting` contains the host dashboard and listing management pages
- `app/api` contains authentication and payment callback routes
- `components` contains reusable UI and feature-specific client components
- `lib/actions` contains server actions for auth, bookings, listings, reviews, emails, and payments
- `prisma/schema.prisma` defines the database models and enums

## Getting Started

### Prerequisites

- Node.js 20 or newer
- PostgreSQL database

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the project root with the required values:

```env
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
KHALTI_SECRET_KEY=
KHALTI_RETURN_URL=http://localhost:3000/api/payment/khalti/verify
KHALTI_WEBSITE_URL=http://localhost:3000
RESEND_API_KEY=
VRS_ADMIN_EMAIL=
```

### Database Setup

Generate the Prisma client and apply the database schema:

```bash
npx prisma generate
npx prisma migrate dev
```

If you want sample data, seed the database:

```bash
npx prisma db seed
```

### Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` starts the development server
- `npm run build` creates a production build
- `npm run start` starts the production server
- `npm run lint` runs ESLint

## Key Routes

- `/` landing page
- `/search` vehicle search and discovery
- `/login` and `/signup` authentication
- `/profile` user profile page
- `/trips` booking and trip history
- `/hosting` host dashboard
- `/hosting/listings` listing management
- `/hosting/bookings` booking management
- `/book/success` and `/book/failure` payment result pages

## Notes

- Sessions use JWT-based Auth.js cookies, so clearing browser cookies can help if you change `NEXTAUTH_SECRET` during development.
- The payment flow uses Khalti’s verify callback at `/api/payment/khalti/verify`.

## License

No license file is included in this repository.
