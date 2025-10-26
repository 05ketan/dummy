-- ============================================================================
-- Planora Database Setup
-- Complete SQL migration for all required tables
-- ============================================================================

-- ============================================================================
-- 1. PROFILES TABLE
-- Extended user profile data with location information
-- ============================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  full_name text,
  avatar_url text,
  home_latitude decimal(10, 8),
  home_longitude decimal(11, 8),
  home_address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- 2. GROUPS TABLE
-- Friend groups for planning activities
-- ============================================================================

CREATE TABLE IF NOT EXISTS groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Group members can view their groups"
  ON groups FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = groups.id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create groups"
  ON groups FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group admins can update groups"
  ON groups FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = groups.id
      AND group_members.user_id = auth.uid()
      AND group_members.role = 'admin'
    )
  );

-- ============================================================================
-- 3. GROUP MEMBERS TABLE
-- Many-to-many relationship between users and groups
-- ============================================================================

CREATE TABLE IF NOT EXISTS group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);

-- Enable RLS
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Group members can view group membership"
  ON group_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_members.group_id
      AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Group admins can insert members"
  ON group_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_members.group_id
      AND group_members.user_id = auth.uid()
      AND group_members.role = 'admin'
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "Group admins can remove members"
  ON group_members FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_members.group_id
      AND group_members.user_id = auth.uid()
      AND group_members.role = 'admin'
    )
    OR user_id = auth.uid()
  );

-- ============================================================================
-- 4. OUTINGS TABLE
-- Planned group activities and events
-- ============================================================================

CREATE TABLE IF NOT EXISTS outings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  location text,
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  scheduled_at timestamptz,
  status text DEFAULT 'planned' CHECK (status IN ('planned', 'confirmed', 'completed', 'cancelled')),
  activity_type text CHECK (activity_type IN ('restaurant', 'movie', 'day_trip', 'other')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_outings_group_id ON outings(group_id);
CREATE INDEX IF NOT EXISTS idx_outings_scheduled_at ON outings(scheduled_at);

-- Enable RLS
ALTER TABLE outings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Group members can view outings"
  ON outings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = outings.group_id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Group members can create outings"
  ON outings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = outings.group_id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Group members can update outings"
  ON outings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = outings.group_id
      AND group_members.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 5. POLLS TABLE
-- Decision-making polls for groups
-- ============================================================================

CREATE TABLE IF NOT EXISTS polls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  outing_id uuid REFERENCES outings(id) ON DELETE CASCADE,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  poll_type text DEFAULT 'location' CHECK (poll_type IN ('location', 'time', 'activity', 'custom')),
  ends_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_polls_group_id ON polls(group_id);
CREATE INDEX IF NOT EXISTS idx_polls_status ON polls(status);

-- Enable RLS
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Group members can view polls"
  ON polls FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = polls.group_id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Group members can create polls"
  ON polls FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = polls.group_id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Poll creators can update polls"
  ON polls FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

-- ============================================================================
-- 6. POLL OPTIONS TABLE
-- Individual options within polls
-- ============================================================================

CREATE TABLE IF NOT EXISTS poll_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_text text NOT NULL,
  option_data jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_poll_options_poll_id ON poll_options(poll_id);

-- Enable RLS
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Group members can view poll options"
  ON poll_options FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM polls
      JOIN group_members ON group_members.group_id = polls.group_id
      WHERE polls.id = poll_options.poll_id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Group members can create poll options"
  ON poll_options FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM polls
      JOIN group_members ON group_members.group_id = polls.group_id
      WHERE polls.id = poll_options.poll_id
      AND group_members.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 7. POLL VOTES TABLE
-- Individual votes on poll options
-- ============================================================================

CREATE TABLE IF NOT EXISTS poll_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_id uuid NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji text DEFAULT '👍',
  created_at timestamptz DEFAULT now(),
  UNIQUE(poll_id, option_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll_id ON poll_votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_option_id ON poll_votes(option_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_user_id ON poll_votes(user_id);

-- Enable RLS
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Group members can view poll votes"
  ON poll_votes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM polls
      JOIN group_members ON group_members.group_id = polls.group_id
      WHERE polls.id = poll_votes.poll_id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Group members can insert votes"
  ON poll_votes FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM polls
      JOIN group_members ON group_members.group_id = polls.group_id
      WHERE polls.id = poll_votes.poll_id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own votes"
  ON poll_votes FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================================
-- 8. CHAT MESSAGES TABLE
-- PlanPal AI Assistant chat messages
-- ============================================================================

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  message text NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_group_id ON chat_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_group_created ON chat_messages(group_id, created_at);

-- Enable Row Level Security
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Group members can read chat messages from their groups
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
  WITH CHECK (
    user_id = auth.uid() AND
    role = 'user' AND
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = chat_messages.group_id
      AND group_members.user_id = auth.uid()
    )
  );

-- Policy: Allow service role to insert assistant messages
-- This is used by the edge function which runs with service role permissions
CREATE POLICY "Service role can insert assistant messages"
  ON chat_messages FOR INSERT
  TO service_role
  WITH CHECK (role = 'assistant');

-- ============================================================================
-- 9. FUNCTIONS AND TRIGGERS
-- Automatic timestamp updates
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_outings_updated_at
  BEFORE UPDATE ON outings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 10. REALTIME PUBLICATION
-- Enable realtime subscriptions for live updates
-- ============================================================================

-- Enable realtime for tables that need live updates
ALTER PUBLICATION supabase_realtime ADD TABLE poll_votes;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE polls;

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================
