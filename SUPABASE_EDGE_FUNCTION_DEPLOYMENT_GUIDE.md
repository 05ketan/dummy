# Supabase Edge Function Deployment Guide
## Complete Setup for PlanPal Chat Function

This guide will walk you through installing the Supabase CLI and deploying your `planpal-chat` edge function to your hosted Supabase project.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Install Supabase CLI](#install-supabase-cli)
3. [Get Required API Keys](#get-required-api-keys)
4. [Authenticate with Supabase](#authenticate-with-supabase)
5. [Link Your Project](#link-your-project)
6. [Configure Environment Secrets](#configure-environment-secrets)
7. [Deploy the Edge Function](#deploy-the-edge-function)
8. [Verify Deployment](#verify-deployment)
9. [Test the Function](#test-the-function)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:
- ✅ Node.js 18+ installed
- ✅ Your Planora project deployed on Vercel
- ✅ Access to your Supabase project dashboard
- ✅ Terminal/Command Prompt access

---

## Install Supabase CLI

### For macOS:
```bash
brew install supabase/tap/supabase
```

### For Windows:
```bash
# Using Scoop
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### For Linux:
```bash
# Using Homebrew on Linux
brew install supabase/tap/supabase

# OR using npm (works on all platforms)
npm install -g supabase
```

### Verify Installation:
```bash
supabase --version
```

You should see output like: `supabase version X.X.X`

---

## Get Required API Keys

### 1. Get Google Gemini API Key

Your edge function uses Google's Gemini AI, so you need an API key:

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Get API Key"** or **"Create API Key"**
4. Copy the API key (starts with `AIza...`)
5. **Save this key securely** - you'll need it later

### 2. Get Supabase Service Role Key

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project (`tmvajyxfacvspvqfcglv`)
3. Navigate to **Settings** → **API**
4. Find the **"service_role" key** section (NOT the anon key)
5. Copy the `service_role` key
6. **Keep this key secret** - it has admin privileges

---

## Authenticate with Supabase

Login to your Supabase account via CLI:

```bash
supabase login
```

This will:
1. Open your browser for authentication
2. Ask you to authorize the CLI
3. Save your credentials locally

---

## Link Your Project

Link your local project to your remote Supabase project:

```bash
cd /path/to/your/planora/project
supabase link --project-ref tmvajyxfacvspvqfcglv
```

When prompted for the database password:
- Go to your Supabase dashboard → **Settings** → **Database**
- Use your database password (you set this when creating the project)
- If you forgot it, you can reset it in the dashboard

You should see: `✓ Linked to project tmvajyxfacvspvqfcglv`

---

## Configure Environment Secrets

Your edge function needs the `GEMINI_API_KEY` environment variable. Set it using the CLI:

```bash
supabase secrets set GEMINI_API_KEY=your_gemini_api_key_here
```

Replace `your_gemini_api_key_here` with your actual Gemini API key from step 3.

To verify secrets are set:
```bash
supabase secrets list
```

You should see:
```
NAME              DIGEST
GEMINI_API_KEY    abc123...
```

**Note**: `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are automatically available in edge functions. You don't need to set them manually.

---

## Deploy the Edge Function

Now deploy your `planpal-chat` edge function:

```bash
supabase functions deploy planpal-chat
```

This will:
1. Package your function code
2. Upload it to Supabase
3. Deploy it to the edge network

You should see output like:
```
Deploying function planpal-chat...
✓ Function planpal-chat deployed
Function URL: https://tmvajyxfacvspvqfcglv.supabase.co/functions/v1/planpal-chat
```

**Important**: Copy the Function URL - your frontend already uses it correctly!

---

## Verify Deployment

### 1. Check in Supabase Dashboard

1. Go to your Supabase dashboard
2. Navigate to **Edge Functions** in the left sidebar
3. You should see `planpal-chat` listed with status "Active"
4. Click on it to see details, logs, and invocation history

### 2. Check via CLI

```bash
supabase functions list
```

You should see:
```
NAME           VERSION    STATUS    CREATED AT
planpal-chat   v1         ACTIVE    2024-10-26...
```

---

## Test the Function

### Test from Command Line

Create a test file `test-planpal.sh`:

```bash
#!/bin/bash

# Replace these with your actual values
SUPABASE_URL="https://tmvajyxfacvspvqfcglv.supabase.co"
USER_TOKEN="your_user_access_token"  # Get this from your browser's dev tools
GROUP_ID="your_test_group_id"

curl -i --location --request POST \
  "${SUPABASE_URL}/functions/v1/planpal-chat" \
  --header "Authorization: Bearer ${USER_TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{
    "message": "Hello PlanPal, what can you help me with?",
    "groupId": "'"${GROUP_ID}"'",
    "conversationHistory": []
  }'
```

Run it:
```bash
chmod +x test-planpal.sh
./test-planpal.sh
```

### Test from Your Website

1. Deploy your Next.js app to Vercel (if not already done)
2. Open your website
3. Navigate to a group page
4. Open the PlanPal chat interface
5. Send a test message
6. You should receive an AI-generated response

### Get Your User Token (for testing)

1. Open your website in Chrome/Firefox
2. Press `F12` to open DevTools
3. Go to **Console** tab
4. Run this command:
   ```javascript
   (await window.supabase.auth.getSession()).data.session.access_token
   ```
5. Copy the token that appears

---

## Troubleshooting

### Issue: "Function not found" error

**Solution**: Ensure you've deployed the function successfully:
```bash
supabase functions list
```

### Issue: "Unauthorized" or 401 error

**Causes**:
- User not logged in
- Invalid access token
- Token expired

**Solution**:
- Ensure user is authenticated in your app
- Check that the Authorization header is being sent correctly
- Verify the token format: `Bearer <token>`

### Issue: "Gemini API key not configured"

**Solution**: Set the secret again:
```bash
supabase secrets set GEMINI_API_KEY=your_actual_key_here
```

### Issue: "Not a member of this group" error

**Cause**: The user making the request is not a member of the specified group

**Solution**:
- Verify the user is a member in the `group_members` table
- Check that the correct `groupId` is being passed

### Issue: Chat history not loading

**Cause**: `chat_messages` table doesn't exist or has incorrect structure

**Solution**: Check your database migration for the `chat_messages` table:
```sql
-- Required table structure
CREATE TABLE chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  created_at timestamptz DEFAULT now()
);
```

### View Function Logs

To see what's happening inside your edge function:

```bash
supabase functions logs planpal-chat --tail
```

This shows real-time logs. You can also view logs in the Supabase dashboard.

### Issue: CORS errors in browser

**Cause**: Missing or incorrect CORS headers

**Solution**: Your function already has correct CORS headers configured. If you still see CORS errors:
1. Clear browser cache
2. Ensure you're not blocking the request with browser extensions
3. Check that the function URL matches exactly: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/planpal-chat`

---

## Updating the Function

After making changes to `supabase/functions/planpal-chat/index.ts`:

```bash
# Deploy the updated version
supabase functions deploy planpal-chat

# Verify it's running the new version
supabase functions logs planpal-chat --tail
```

---

## Environment Variables Summary

### Required Secrets (set via CLI):
- ✅ `GEMINI_API_KEY` - Your Google Gemini API key

### Automatically Available:
- ✅ `SUPABASE_URL` - Your project URL
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Admin access key
- ✅ `SUPABASE_ANON_KEY` - Public access key

### Frontend Environment Variables:
Your `.env` or `.env.local` should have:
```env
NEXT_PUBLIC_SUPABASE_URL=https://tmvajyxfacvspvqfcglv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Database Tables Required

Ensure these tables exist in your Supabase database:

### 1. `chat_messages`
Stores chat conversation history
```sql
CREATE TABLE chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  message text NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read messages from groups they're members of
CREATE POLICY "Group members can read chat messages"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = chat_messages.group_id
      AND group_members.user_id = auth.uid()
    )
  );

-- Policy: Authenticated users can insert their own messages
CREATE POLICY "Users can insert their messages"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy: System can insert assistant messages (user_id is null)
CREATE POLICY "System can insert assistant messages"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (role = 'assistant' AND user_id IS NULL);
```

### 2. `group_members`
Verifies user membership in groups
```sql
-- This table should already exist from your initial setup
-- Ensure it has these columns:
-- - id: uuid (primary key)
-- - group_id: uuid (references groups)
-- - user_id: uuid (references auth.users)
-- - role: text (e.g., 'admin', 'member')
-- - created_at: timestamptz
```

### 3. `groups`
Stores group information
```sql
-- This table should already exist
-- Ensure it has these columns:
-- - id: uuid (primary key)
-- - name: text
-- - description: text
-- - created_at: timestamptz
```

### 4. `outings`
Stores upcoming group outings
```sql
-- This table should already exist
-- Used by the AI to provide context about upcoming plans
```

### 5. `polls`
Stores active polls
```sql
-- This table should already exist
-- Used by the AI to provide context about active polls
```

---

## Security Notes

1. **Never commit** your Gemini API key or service role key to git
2. The `service_role` key has admin access - keep it secure
3. Always use environment variables for sensitive data
4. The edge function validates:
   - User authentication
   - Group membership
   - Proper authorization headers

---

## Cost Considerations

### Supabase Edge Functions:
- **Free tier**: 500,000 invocations/month
- **Pro tier**: 2,000,000 invocations/month
- Each chat message = 1 invocation

### Google Gemini API:
- **Free tier**: 60 requests/minute
- **Flash model**: 15 requests/minute (free)
- Check [Google AI Pricing](https://ai.google.dev/pricing) for details

---

## Next Steps

After successful deployment:

1. ✅ Test the chat function in your live application
2. ✅ Monitor function invocations in Supabase dashboard
3. ✅ Set up error alerts if needed
4. ✅ Consider rate limiting for production use
5. ✅ Monitor Gemini API usage quotas

---

## Quick Reference Commands

```bash
# Login to Supabase
supabase login

# Link project
supabase link --project-ref tmvajyxfacvspvqfcglv

# Set secrets
supabase secrets set GEMINI_API_KEY=your_key_here

# List secrets
supabase secrets list

# Deploy function
supabase functions deploy planpal-chat

# List functions
supabase functions list

# View logs
supabase functions logs planpal-chat --tail

# Delete function (if needed)
supabase functions delete planpal-chat
```

---

## Support

If you encounter issues:

1. Check the [Supabase Edge Functions Documentation](https://supabase.com/docs/guides/functions)
2. View function logs: `supabase functions logs planpal-chat`
3. Check Supabase dashboard for errors
4. Review the troubleshooting section above

---

## Summary

You now have a complete guide to:
- ✅ Install Supabase CLI
- ✅ Authenticate and link your project
- ✅ Configure API keys and secrets
- ✅ Deploy the planpal-chat edge function
- ✅ Test and verify the deployment
- ✅ Troubleshoot common issues

Your PlanPal chat feature should now be fully functional on your hosted website!
