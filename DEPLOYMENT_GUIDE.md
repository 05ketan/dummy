# Complete Deployment Guide for Planora

This guide covers the complete deployment process for your Planora application, including database setup, edge function deployment, and Vercel deployment.

---

## Table of Contents

1. [Database Setup](#1-database-setup)
2. [Edge Function Deployment](#2-edge-function-deployment)
3. [Vercel Deployment](#3-vercel-deployment)
4. [Post-Deployment Testing](#4-post-deployment-testing)
5. [Troubleshooting](#5-troubleshooting)

---

## 1. Database Setup

### Step 1: Run Database Migration

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **"New Query"**
5. Copy the entire contents of `database-setup.sql` (in your project root)
6. Paste it into the SQL editor
7. Click **"Run"** (or press `Ctrl+Enter` / `Cmd+Enter`)
8. Wait for all statements to execute successfully

### Step 2: Verify Tables Created

1. In Supabase dashboard, go to **Database** → **Tables**
2. You should see these tables:
   - ✅ profiles
   - ✅ groups
   - ✅ group_members
   - ✅ outings
   - ✅ polls
   - ✅ poll_options
   - ✅ poll_votes
   - ✅ chat_messages

### Step 3: Create Your First User

1. Go to **Authentication** → **Users** in Supabase dashboard
2. Click **"Add user"**
3. Enter email and password
4. Click **"Create user"**
5. The user will be added to `auth.users` table

### Step 4: Seed Initial Data (Optional)

Create a test group to verify everything works:

```sql
-- 1. Insert a profile for your user (replace the UUID with your user ID)
INSERT INTO profiles (id, username, full_name)
VALUES ('your-user-id-here', 'testuser', 'Test User');

-- 2. Create a test group
INSERT INTO groups (id, name, description, created_by)
VALUES (
  gen_random_uuid(),
  'Test Group',
  'A test group for trying out features',
  'your-user-id-here'
)
RETURNING id;

-- 3. Add yourself as a member (replace group-id with the ID from step 2)
INSERT INTO group_members (group_id, user_id, role)
VALUES ('group-id-from-step-2', 'your-user-id-here', 'admin');
```

---

## 2. Edge Function Deployment

### Prerequisites

Before deploying edge functions, you need:
- ✅ Supabase CLI installed
- ✅ Google Gemini API key
- ✅ Database tables created (from Step 1)

### Step 1: Install Supabase CLI

#### macOS:
```bash
brew install supabase/tap/supabase
```

#### Windows (using Scoop):
```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

#### Linux:
```bash
brew install supabase/tap/supabase
```

#### All Platforms (using npm):
```bash
npm install -g supabase
```

Verify installation:
```bash
supabase --version
```

### Step 2: Get Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the API key (starts with `AIza...`)
5. Save it securely

### Step 3: Authenticate with Supabase

```bash
supabase login
```

This opens your browser for authentication. Follow the prompts.

### Step 4: Link Your Project

```bash
cd /path/to/your/planora/project
supabase link --project-ref tmvajyxfacvspvqfcglv
```

When prompted for database password:
- Find it in Supabase dashboard → **Settings** → **Database**
- Or reset it if you forgot

### Step 5: Set Environment Secrets

```bash
supabase secrets set GEMINI_API_KEY=your_actual_gemini_api_key_here
```

Verify:
```bash
supabase secrets list
```

### Step 6: Deploy the Edge Function

```bash
supabase functions deploy planpal-chat
```

You should see:
```
Deploying function planpal-chat...
✓ Function planpal-chat deployed
Function URL: https://tmvajyxfacvspvqfcglv.supabase.co/functions/v1/planpal-chat
```

### Step 7: Verify Deployment

Check in Supabase dashboard:
1. Go to **Edge Functions**
2. You should see `planpal-chat` with status "Active"

Or via CLI:
```bash
supabase functions list
```

---

## 3. Vercel Deployment

### Step 1: Push to GitHub

If not already done:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin your-github-repo-url
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `npm run build` (or leave default)
   - **Output Directory**: Leave default

### Step 3: Set Environment Variables

In Vercel project settings, add these environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tmvajyxfacvspvqfcglv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdmFqeXhmYWN2c3B2cWZjZ2x2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MTI2NDQsImV4cCI6MjA3Njk4ODY0NH0.HZfi5kVNJdW-vCL6B6JvqborgzBtCcjoXNdueuIladc
```

**Important**: These are the same values from your `.env` file.

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for build to complete
3. Vercel will provide your deployment URL (e.g., `your-app.vercel.app`)

### Step 5: Configure Custom Domain (Optional)

1. In Vercel project, go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions

---

## 4. Post-Deployment Testing

### Test 1: Authentication

1. Open your deployed website
2. Go to `/signup`
3. Create a new account
4. Verify you can sign in at `/login`

### Test 2: Database Connection

1. After login, go to `/groups`
2. Try creating a new group
3. Verify it appears in Supabase dashboard → **Database** → **groups** table

### Test 3: PlanPal Chat

1. Navigate to a group page
2. Find the PlanPal chat interface
3. Send a test message: "Hello PlanPal!"
4. You should receive an AI-generated response

### Test 4: Real-time Features

1. Create a poll in a group
2. Open the same group in two different browser windows
3. Vote on the poll in one window
4. Verify the vote updates in real-time in the other window

### Test 5: Edge Function Logs

Check edge function is working:

```bash
supabase functions logs planpal-chat --tail
```

Or in Supabase dashboard:
1. Go to **Edge Functions**
2. Click on `planpal-chat`
3. View **Logs** tab

---

## 5. Troubleshooting

### Issue: "Failed to fetch" when calling edge function

**Causes**:
- Edge function not deployed
- Incorrect function URL
- CORS issues

**Solutions**:
1. Verify function is deployed:
   ```bash
   supabase functions list
   ```
2. Check function URL in your code (`components/groups/PlanPalChat.tsx`):
   ```typescript
   `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/planpal-chat`
   ```
3. Check edge function logs:
   ```bash
   supabase functions logs planpal-chat
   ```

### Issue: "Gemini API key not configured"

**Solution**: Set the secret again:
```bash
supabase secrets set GEMINI_API_KEY=your_key_here
supabase functions deploy planpal-chat
```

### Issue: "Relation does not exist" error

**Cause**: Database tables not created

**Solution**: Run the `database-setup.sql` script in Supabase SQL Editor

### Issue: Can't create groups or polls

**Cause**: Row Level Security (RLS) policies blocking access

**Solution**:
1. Check if you're logged in
2. Verify RLS policies in Supabase dashboard → **Database** → **Tables** → select table → **Policies**
3. Re-run the database setup script if policies are missing

### Issue: Vercel build fails

**Common causes**:
- Missing environment variables
- TypeScript errors
- Missing dependencies

**Solutions**:
1. Check build logs in Vercel dashboard
2. Ensure environment variables are set
3. Run locally first:
   ```bash
   npm run build
   ```
4. Fix any errors before deploying

### Issue: Real-time updates not working

**Solutions**:
1. Check Realtime is enabled in Supabase dashboard → **Database** → **Replication**
2. Verify tables are published:
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE poll_votes;
   ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
   ```

---

## Environment Variables Summary

### Required in Vercel:
```env
NEXT_PUBLIC_SUPABASE_URL=https://tmvajyxfacvspvqfcglv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### Required in Supabase (for edge functions):
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

### Automatically Available in Edge Functions:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`

---

## Quick Command Reference

```bash
# Supabase Login
supabase login

# Link project
supabase link --project-ref tmvajyxfacvspvqfcglv

# Set secrets
supabase secrets set GEMINI_API_KEY=your_key

# Deploy edge function
supabase functions deploy planpal-chat

# View logs
supabase functions logs planpal-chat --tail

# List functions
supabase functions list

# List secrets
supabase secrets list

# Git commands
git add .
git commit -m "Your message"
git push origin main
```

---

## Cost Considerations

### Supabase
- **Free tier**:
  - 500MB database space
  - 500,000 edge function invocations/month
  - 2GB bandwidth
  - Suitable for development and small apps

- **Pro tier** ($25/month):
  - 8GB database space
  - 2,000,000 edge function invocations/month
  - 50GB bandwidth

### Google Gemini API
- **Free tier**:
  - 15 RPM (requests per minute) for Flash model
  - 60 RPM for other models
  - Suitable for small to medium apps

- Check [Google AI Pricing](https://ai.google.dev/pricing) for production limits

### Vercel
- **Free tier (Hobby)**:
  - Unlimited deployments
  - 100GB bandwidth
  - Serverless functions
  - Suitable for personal projects

- **Pro tier** ($20/month):
  - Team collaboration
  - Analytics
  - Password protection

---

## Next Steps After Deployment

1. ✅ Set up custom domain
2. ✅ Configure analytics (Vercel Analytics, Google Analytics)
3. ✅ Set up error monitoring (Sentry, LogRocket)
4. ✅ Enable database backups in Supabase
5. ✅ Set up API rate limiting
6. ✅ Configure SMTP for email notifications (if needed)
7. ✅ Create user documentation
8. ✅ Set up CI/CD pipeline (GitHub Actions)

---

## Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Vercel Docs**: https://vercel.com/docs
- **Google AI Studio**: https://makersuite.google.com

---

## Summary Checklist

### Database Setup
- ✅ Run `database-setup.sql` in Supabase SQL Editor
- ✅ Verify all 8 tables are created
- ✅ Create test user in Authentication
- ✅ (Optional) Seed initial test data

### Edge Function Deployment
- ✅ Install Supabase CLI
- ✅ Get Gemini API key
- ✅ Login to Supabase CLI
- ✅ Link project
- ✅ Set GEMINI_API_KEY secret
- ✅ Deploy planpal-chat function
- ✅ Verify deployment

### Vercel Deployment
- ✅ Push code to GitHub
- ✅ Import project to Vercel
- ✅ Set environment variables
- ✅ Deploy

### Testing
- ✅ Test authentication
- ✅ Test database operations
- ✅ Test PlanPal chat
- ✅ Test real-time features
- ✅ Monitor edge function logs

---

Your Planora application should now be fully deployed and functional! 🎉
