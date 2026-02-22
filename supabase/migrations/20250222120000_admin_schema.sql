-- Admin Dashboard schema for AgentForm
-- Run when Supabase is configured. Supports admin API endpoints.

-- Admin users (extends auth.users with role/status for admin dashboard)
-- In production, this could be a view over auth.users + profiles
CREATE TABLE IF NOT EXISTS admin_users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user', 'guest')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users (email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users (username);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users (role);
CREATE INDEX IF NOT EXISTS idx_admin_users_status ON admin_users (status);

-- Admin agent moderation (links to agents with moderation status)
CREATE TABLE IF NOT EXISTS admin_agent_moderation (
  agent_id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'flagged')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_agent_moderation_status ON admin_agent_moderation (status);

-- Admin logs (webhook, error, security)
CREATE TABLE IF NOT EXISTS admin_logs (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('webhook', 'error', 'security')),
  description TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_logs_type ON admin_logs (type);
CREATE INDEX IF NOT EXISTS idx_admin_logs_timestamp ON admin_logs (timestamp DESC);

-- Admin billing
CREATE TABLE IF NOT EXISTS admin_billing (
  billing_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES admin_users(user_id),
  plan TEXT NOT NULL,
  usage INTEGER NOT NULL DEFAULT 0,
  amount_due DECIMAL(10, 2) NOT NULL DEFAULT 0,
  due_date DATE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_billing_user_id ON admin_billing (user_id);

-- RLS policies (admin-only access)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_agent_moderation ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_billing ENABLE ROW LEVEL SECURITY;

-- Policy: only admins can read/write admin tables
-- Replace with actual auth.uid() check when Supabase Auth is configured
CREATE POLICY "Admin users read" ON admin_users FOR SELECT USING (true);
CREATE POLICY "Admin users update" ON admin_users FOR UPDATE USING (true);
CREATE POLICY "Admin agent moderation read" ON admin_agent_moderation FOR SELECT USING (true);
CREATE POLICY "Admin agent moderation update" ON admin_agent_moderation FOR UPDATE USING (true);
CREATE POLICY "Admin logs read" ON admin_logs FOR SELECT USING (true);
CREATE POLICY "Admin billing read" ON admin_billing FOR SELECT USING (true);
