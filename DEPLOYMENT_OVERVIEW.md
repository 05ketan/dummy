# Planora Deployment Overview

A visual guide to understanding your deployment architecture and setup process.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                          │
│                     (your-app.vercel.app)                       │
└───────────────┬─────────────────────────────────────────────────┘
                │
                │ HTTPS Requests
                │
                ▼
┌───────────────────────────────────────────────────────────────────┐
│                      VERCEL (Next.js App)                         │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  • Serves UI (React Components)                          │    │
│  │  • Handles routing                                       │    │
│  │  • Authentication pages                                  │    │
│  │  • Group management                                      │    │
│  └─────────────────────────────────────────────────────────┘    │
└────┬──────────────────────────┬────────────────────────────────┘
     │                          │
     │ Auth & Database          │ Edge Function
     │ Requests                 │ Requests
     │                          │
     ▼                          ▼
┌──────────────────────────────────────────────────────────────────┐
│                    SUPABASE PLATFORM                             │
│                 (tmvajyxfacvspvqfcglv.supabase.co)              │
│  ┌────────────────────┐  ┌─────────────────────────────────┐   │
│  │   Auth Service     │  │    PostgreSQL Database          │   │
│  │  • User login      │  │  Tables:                        │   │
│  │  • Signup          │  │   • profiles                    │   │
│  │  • Sessions        │  │   • groups                      │   │
│  │  • JWT tokens      │  │   • group_members               │   │
│  └────────────────────┘  │   • outings                     │   │
│                          │   • polls                       │   │
│  ┌────────────────────┐  │   • poll_options                │   │
│  │  Edge Functions    │  │   • poll_votes                  │   │
│  │  ┌──────────────┐  │  │   • chat_messages               │   │
│  │  │ planpal-chat │  │  │                                 │   │
│  │  │  (AI Chat)   │  │  │  RLS Policies: Secure access    │   │
│  │  └──────────────┘  │  │  Realtime: Live updates         │   │
│  └────────────────────┘  └─────────────────────────────────┘   │
│           │                                                      │
│           │ Queries Gemini AI                                   │
│           ▼                                                      │
│  GEMINI_API_KEY (Secret)                                        │
└───────────┬──────────────────────────────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────────────────────────────────┐
│               GOOGLE GEMINI AI (External API)                     │
│  • Gemini 1.5 Flash Model                                         │
│  • Generates AI responses                                         │
│  • Provides planning assistance                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## Deployment Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    STEP 1: DATABASE SETUP                       │
│                         (5 minutes)                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Go to Supabase Dashboard                                    │
│     └─> SQL Editor                                             │
│                                                                 │
│  2. Run database-setup.sql                                      │
│     └─> Creates 8 tables                                       │
│     └─> Sets up RLS policies                                   │
│     └─> Enables realtime                                       │
│                                                                 │
│  3. Verify tables exist                                         │
│     └─> Database → Tables                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              STEP 2: EDGE FUNCTION DEPLOYMENT                   │
│                         (5 minutes)                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Install Supabase CLI                                        │
│     └─> brew install supabase (macOS)                          │
│     └─> npm install -g supabase (All platforms)                │
│                                                                 │
│  2. Get Gemini API Key                                          │
│     └─> https://makersuite.google.com/app/apikey              │
│                                                                 │
│  3. Authenticate & Link                                         │
│     └─> supabase login                                         │
│     └─> supabase link --project-ref tmvajyxfacvspvqfcglv      │
│                                                                 │
│  4. Set Secrets                                                 │
│     └─> supabase secrets set GEMINI_API_KEY=your_key          │
│                                                                 │
│  5. Deploy Function                                             │
│     └─> supabase functions deploy planpal-chat                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                STEP 3: VERCEL DEPLOYMENT                        │
│                         (5 minutes)                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Push to GitHub                                              │
│     └─> git init && git add . && git commit && git push        │
│                                                                 │
│  2. Import to Vercel                                            │
│     └─> vercel.com/dashboard → Add New Project                 │
│     └─> Connect GitHub repo                                    │
│                                                                 │
│  3. Set Environment Variables                                   │
│     └─> NEXT_PUBLIC_SUPABASE_URL                              │
│     └─> NEXT_PUBLIC_SUPABASE_ANON_KEY                         │
│                                                                 │
│  4. Deploy                                                      │
│     └─> Vercel automatically builds & deploys                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    STEP 4: TEST & VERIFY                        │
│                         (2 minutes)                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Open deployed site                                          │
│  2. Test signup/login                                           │
│  3. Create a group                                              │
│  4. Test PlanPal chat                                           │
│  5. Verify real-time updates                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Files Created for You

### 1. `database-setup.sql` (14KB)
Complete database schema with all tables, RLS policies, and triggers.
**Use**: Run in Supabase SQL Editor to create database structure.

### 2. `DEPLOYMENT_GUIDE.md` (11KB)
Comprehensive step-by-step guide with detailed explanations.
**Use**: Follow for complete deployment instructions.

### 3. `SUPABASE_EDGE_FUNCTION_DEPLOYMENT_GUIDE.md` (13KB)
Detailed guide focused on edge function deployment.
**Use**: Reference for edge function specific setup.

### 4. `QUICK_START.md` (3.3KB)
Condensed 15-minute deployment checklist.
**Use**: Quick reference for experienced developers.

### 5. `DEPLOYMENT_OVERVIEW.md` (This file)
Visual architecture and process overview.
**Use**: Understand the system architecture.

---

## Key Components

### Frontend (Next.js on Vercel)
```
app/
├── (auth)/
│   ├── login/page.tsx        ← User login
│   └── signup/page.tsx       ← User registration
├── (dashboard)/
│   ├── groups/
│   │   ├── [group_id]/       ← Individual group page
│   │   └── page.tsx          ← Groups list
│   └── profile/              ← User profile
└── page.tsx                  ← Landing page

components/
└── groups/
    ├── PlanPalChat.tsx       ← AI chat interface
    ├── PollComponent.tsx     ← Real-time polling
    └── PlanInputForm.tsx     ← Activity planning form

lib/
├── supabase/
│   ├── client.ts             ← Browser Supabase client
│   └── server.ts             ← Server Supabase client
└── SRE/
    └── index.ts              ← Smart Recommendation Engine
```

### Backend (Supabase)

#### Database Tables:
1. **profiles** - User extended data
2. **groups** - Friend groups
3. **group_members** - Group membership
4. **outings** - Planned activities
5. **polls** - Decision polls
6. **poll_options** - Poll choices
7. **poll_votes** - User votes
8. **chat_messages** - AI chat history

#### Edge Function:
```
supabase/functions/planpal-chat/index.ts
```
- Authenticates users
- Validates group membership
- Calls Gemini AI
- Saves chat history
- Returns AI responses

---

## Environment Variables

### Frontend (.env or Vercel)
```env
NEXT_PUBLIC_SUPABASE_URL=https://tmvajyxfacvspvqfcglv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Edge Function (Supabase Secrets)
```bash
GEMINI_API_KEY=AIza...  # Set via: supabase secrets set
```

### Auto-Available in Edge Functions
```
SUPABASE_URL              # Your project URL
SUPABASE_SERVICE_ROLE_KEY # Admin access key
SUPABASE_ANON_KEY         # Public access key
```

---

## Security Features

### Row Level Security (RLS)
Every table has RLS enabled with policies ensuring:
- Users only see their own data
- Group members only access their groups
- Proper authentication checks
- Admin-only operations protected

### Authentication Flow
```
User → Login → JWT Token → Supabase Auth → Validates → Access Granted
                    ↓
              Stored in Cookie
                    ↓
         Sent with every request
```

### Edge Function Security
```
Request → Check Auth Header → Verify JWT → Check Group Membership → Process
   ↓           ↓                  ↓              ↓                    ↓
  401       Extract           Validate      Query DB            Execute
           Bearer           User ID     for membership      AI & Save
```

---

## Data Flow: Sending a Chat Message

```
┌──────────────┐
│    User      │
│ Types message│
└──────┬───────┘
       │
       ▼
┌────────────────────────────────────┐
│  PlanPalChat.tsx (Frontend)        │
│  • Get user session & token        │
│  • Prepare request payload         │
└──────┬─────────────────────────────┘
       │
       │ POST /functions/v1/planpal-chat
       │ Headers: Authorization: Bearer <token>
       │ Body: { message, groupId, conversationHistory }
       │
       ▼
┌────────────────────────────────────┐
│  Edge Function: planpal-chat       │
│  1. Verify authentication          │
│  2. Check group membership         │
│  3. Fetch group context            │
│  4. Query Gemini AI                │
│  5. Save messages to DB            │
└──────┬─────────────────────────────┘
       │
       │ Insert into chat_messages
       ▼
┌────────────────────────────────────┐
│  Supabase Database                 │
│  • Save user message               │
│  • Save AI response                │
│  • Trigger realtime update         │
└──────┬─────────────────────────────┘
       │
       │ Response: { message: "AI response" }
       ▼
┌────────────────────────────────────┐
│  Frontend: Display message         │
│  • Update chat UI                  │
│  • Scroll to bottom                │
│  • Enable input field              │
└────────────────────────────────────┘
```

---

## Cost Breakdown (Monthly)

### Free Tier Usage
```
Supabase Free:
  ✓ 500MB Database
  ✓ 500,000 Edge Function calls
  ✓ 2GB Bandwidth
  ✓ Realtime connections
  → $0/month

Google Gemini Free:
  ✓ 15 RPM (requests per minute)
  ✓ Gemini Flash model
  → $0/month

Vercel Hobby:
  ✓ Unlimited deployments
  ✓ 100GB bandwidth
  ✓ Serverless functions
  → $0/month

Total: $0/month (up to limits above)
```

### When to Upgrade
```
Upgrade to Supabase Pro ($25/mo) when:
  • Database > 500MB
  • Edge calls > 500k/month
  • Need more bandwidth

Upgrade to Gemini Paid when:
  • Need > 15 RPM
  • High-volume production app

Upgrade to Vercel Pro ($20/mo) when:
  • Need team collaboration
  • Want analytics
  • Need password protection
```

---

## Monitoring & Maintenance

### Check Edge Function Health
```bash
# View real-time logs
supabase functions logs planpal-chat --tail

# Check function status
supabase functions list

# View invocation count (Supabase dashboard)
Edge Functions → planpal-chat → Metrics
```

### Monitor Database
```sql
-- Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Count messages
SELECT COUNT(*) FROM chat_messages;

-- Recent chat activity
SELECT
  g.name as group_name,
  COUNT(*) as message_count,
  MAX(cm.created_at) as last_message
FROM chat_messages cm
JOIN groups g ON g.id = cm.group_id
GROUP BY g.id, g.name
ORDER BY last_message DESC;
```

### Vercel Monitoring
- Deployment logs: Vercel dashboard → Deployments
- Runtime logs: Vercel dashboard → Functions
- Analytics: Enable Vercel Analytics

---

## Common Issues & Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| Chat not responding | `supabase functions logs planpal-chat` |
| 401 Unauthorized | Check user is logged in |
| 403 Forbidden | Verify group membership |
| Database errors | Re-run `database-setup.sql` |
| Build failing | Run `npm run build` locally |
| Realtime not working | Check Replication in Supabase |

---

## Next Steps After Deployment

1. ✅ **Test all features** - Go through user flows
2. ✅ **Set up monitoring** - Enable alerts for errors
3. ✅ **Configure domain** - Add custom domain in Vercel
4. ✅ **Enable backups** - Set up database backups
5. ✅ **Document API** - Create API documentation
6. ✅ **User testing** - Get feedback from real users
7. ✅ **Performance optimization** - Monitor and optimize
8. ✅ **Scale planning** - Plan for growth

---

## Support & Resources

### Documentation
- Main guide: `DEPLOYMENT_GUIDE.md`
- Quick start: `QUICK_START.md`
- Edge functions: `SUPABASE_EDGE_FUNCTION_DEPLOYMENT_GUIDE.md`
- Database: `database-setup.sql`

### External Resources
- Supabase: https://supabase.com/docs
- Vercel: https://vercel.com/docs
- Next.js: https://nextjs.org/docs
- Gemini AI: https://ai.google.dev

### Your Dashboards
- Supabase: https://supabase.com/dashboard/project/tmvajyxfacvspvqfcglv
- Vercel: https://vercel.com/dashboard
- Google AI: https://makersuite.google.com

---

## Architecture Summary

```
┌─────────────────────────────────────────────────────────┐
│  Planora: Modern Group Planning Application            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Frontend:  Next.js 16 + React 18 + TypeScript         │
│  Hosting:   Vercel (Serverless)                        │
│  Database:  Supabase PostgreSQL                        │
│  Auth:      Supabase Auth (Email/Password)             │
│  Realtime:  Supabase Realtime (WebSockets)             │
│  Edge:      Supabase Edge Functions (Deno)             │
│  AI:        Google Gemini 1.5 Flash                    │
│  UI:        shadcn/ui + Tailwind CSS                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

Ready to deploy? Start with `QUICK_START.md` for a fast 15-minute setup,
or `DEPLOYMENT_GUIDE.md` for detailed step-by-step instructions.
