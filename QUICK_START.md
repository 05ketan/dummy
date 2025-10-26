# Quick Start Guide - Deploy Planora in 15 Minutes

This is a condensed version of the deployment process. For detailed instructions, see `DEPLOYMENT_GUIDE.md`.

---

## Step 1: Database Setup (5 minutes)

1. Go to https://supabase.com/dashboard
2. Open your project → **SQL Editor**
3. Open `database-setup.sql` file from your project
4. Copy all contents → Paste in SQL Editor → Click **"Run"**
5. Verify 8 tables created in **Database** → **Tables**

**Tables created**: profiles, groups, group_members, outings, polls, poll_options, poll_votes, chat_messages

---

## Step 2: Edge Function Setup (5 minutes)

### Install CLI:
```bash
# macOS
brew install supabase/tap/supabase

# Windows
scoop install supabase

# All platforms
npm install -g supabase
```

### Deploy Function:
```bash
# Login
supabase login

# Link project
cd /path/to/planora
supabase link --project-ref tmvajyxfacvspvqfcglv

# Set Gemini API key (get from https://makersuite.google.com/app/apikey)
supabase secrets set GEMINI_API_KEY=your_key_here

# Deploy
supabase functions deploy planpal-chat
```

---

## Step 3: Vercel Deployment (5 minutes)

1. Push to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. Go to https://vercel.com/dashboard → **"Add New Project"**

3. Import your GitHub repo

4. Add environment variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tmvajyxfacvspvqfcglv.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdmFqeXhmYWN2c3B2cWZjZ2x2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MTI2NDQsImV4cCI6MjA3Njk4ODY0NH0.HZfi5kVNJdW-vCL6B6JvqborgzBtCcjoXNdueuIladc
   ```

5. Click **"Deploy"**

---

## Verify It Works

1. Open your deployed site (e.g., `your-app.vercel.app`)
2. Sign up at `/signup`
3. Create a group at `/groups`
4. Open the group and test PlanPal chat
5. Send message: "Hello!" → Should get AI response

---

## Troubleshooting

### Chat not working?
```bash
# Check function deployed
supabase functions list

# View logs
supabase functions logs planpal-chat --tail
```

### Database errors?
- Re-run `database-setup.sql` in Supabase SQL Editor
- Check if you're logged in

### Vercel build failed?
- Check environment variables are set
- Run `npm run build` locally first

---

## Important Files in Your Project

- `DEPLOYMENT_GUIDE.md` - Complete detailed guide
- `database-setup.sql` - Database migration SQL
- `supabase/functions/planpal-chat/index.ts` - Edge function code
- `.env` - Local environment variables (don't commit!)

---

## Key URLs

- **Supabase Dashboard**: https://supabase.com/dashboard
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Google AI Studio** (for API key): https://makersuite.google.com/app/apikey
- **Your Supabase Project**: https://tmvajyxfacvspvqfcglv.supabase.co

---

## Quick Commands

```bash
# Deploy edge function
supabase functions deploy planpal-chat

# View function logs
supabase functions logs planpal-chat --tail

# Update secrets
supabase secrets set GEMINI_API_KEY=new_key

# Push to git
git add . && git commit -m "Update" && git push
```

---

That's it! Your app should be live and fully functional. For detailed troubleshooting and advanced configuration, see `DEPLOYMENT_GUIDE.md`.
