# Planora

**Smart Group Coordination Made Simple**

Planora is a modern Next.js application designed to solve the coordination challenges of planning group outings. Using intelligent location algorithms and real-time polling, Planora helps friends find the perfect meeting spot that works for everyone.

## Features

- **Smart Recommendation Engine (SRE)**: Calculates optimal meeting points using weighted geospatial algorithms
- **Real-time Polling**: Vote with emoji reactions and see results instantly via Supabase Realtime
- **Group Management**: Create and manage multiple friend groups
- **Authentication**: Secure email/password authentication with Supabase Auth
- **User Profiles**: Store home locations and preferences for personalized recommendations
- **Activity Planning**: Support for restaurants, movies, and day trips
- **Mood-Based Filtering**: Get recommendations based on group mood (Chill, Foodie, Adventurous)

## Tech Stack

- **Framework**: Next.js with App Router
- **Language**: TypeScript
- **Package Manager**: pnpm
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)

## Project Structure

```
Planora/
├── .husky/                    # Git hooks for quality enforcement
│   ├── pre-commit            # Runs linting and type checking
│   └── pre-push              # Runs production build validation
├── .github/workflows/
│   └── main-ci.yml           # CI/CD pipeline with GitHub Actions
├── app/
│   ├── (auth)/               # Authentication routes
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/          # Protected dashboard routes
│   │   ├── groups/
│   │   │   ├── [group_id]/  # Group detail with polls
│   │   │   └── page.tsx     # Groups list
│   │   └── profile/         # User profile management
│   ├── layout.tsx
│   ├── page.tsx              # Landing page
│   └── globals.css
├── components/
│   ├── ui/                   # shadcn/ui components
│   └── groups/
│       ├── PollComponent.tsx # Real-time polling with Supabase
│       └── PlanInputForm.tsx # Planning form with SRE integration
├── lib/
│   ├── supabase/
│   │   ├── client.ts        # Browser client
│   │   └── server.ts        # Server component client
│   └── SRE/
│       └── index.ts         # Smart Recommendation Engine
├── middleware.ts            # Route authentication
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (installed automatically via npm)
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd planora
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Initialize Husky:
```bash
pnpm prepare
```

5. Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Database Setup

The application requires a Supabase PostgreSQL database with the following core tables:

- `users` - User authentication (managed by Supabase Auth)
- `user_profiles` - Extended profile data with location coordinates
- `groups` - Friend groups
- `users_groups` - Many-to-many relationship
- `events` - Planned outings
- `polls` - Decision mechanisms
- `poll_options` - Voting options
- `poll_votes` - Individual votes with emoji reactions
- `rsvps` - Final attendance tracking

### Row Level Security (RLS)

All tables must have RLS enabled with appropriate policies to ensure users can only access their own data or data from groups they belong to.

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm typecheck` - Run TypeScript type checking

## Code Quality

### Git Hooks

The project uses Husky to enforce code quality:

- **pre-commit**: Runs linting and type checking before commits
- **pre-push**: Runs production build before pushing to remote

### CI/CD Pipeline

GitHub Actions workflow runs on all pushes and pull requests:

1. Install dependencies
2. Run ESLint
3. Run TypeScript type checking
4. Build for production
5. Deploy to Vercel (on main branch)

## Smart Recommendation Engine

The SRE calculates optimal meeting locations using:

1. **Weighted Centroid Calculation**:
   - Converts lat/lon to 3D Cartesian coordinates
   - Applies weights (e.g., 1.5x for plan initiator)
   - Calculates geographic mean center

2. **Aggregate Location Score (ALS)**:
   ```
   ALS = W_proximity × Score_proximity + W_rating × Score_rating + W_mood × Score_mood
   ```

3. **Mood-Based Filtering**:
   - Foodie: Restaurant and cafe types
   - Adventurous: Parks, museums, attractions
   - Chill: Cafes, libraries, spas

## Real-time Features

Planora uses Supabase Realtime to provide instant updates:

- Live poll results with emoji reactions
- Group chat with broadcast channels
- Event updates across all devices

## Authentication

Authentication is handled by Supabase Auth with:

- Email/password authentication
- Session management via cookies
- Edge middleware for route protection
- Automatic redirect handling

Protected routes: `/groups/*`, `/profile/*`

## Deployment

The application is optimized for Vercel deployment:

1. Connect your repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main branch

### Environment Variables

Required for deployment:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## API Integrations

- **Google Places API**: Location suggestions and ratings
- **TMDB API**: Movie recommendations (with required attribution)

## Future Enhancements

- External calendar integration (Google Calendar, Outlook)
- Advanced geospatial logic with real-time traffic data
- AI-driven chatbot evolution using LLMs
- Push notifications for group updates
- Mobile app with React Native