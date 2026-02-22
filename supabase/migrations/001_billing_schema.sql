-- Billing & Usage Metering Schema
-- Run this migration to create the required tables for the billing feature

-- Extend users table with stripe_customer_id if not exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Plans table
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  quota_sessions INTEGER NOT NULL DEFAULT 100,
  quota_tokens INTEGER NOT NULL DEFAULT 100000,
  price_per_month DECIMAL(10, 2) NOT NULL DEFAULT 0,
  stripe_price_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT plans_price_positive CHECK (price_per_month >= 0),
  CONSTRAINT plans_quota_sessions_positive CHECK (quota_sessions >= 0),
  CONSTRAINT plans_quota_tokens_positive CHECK (quota_tokens >= 0)
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Sessions (usage tracking)
CREATE TABLE IF NOT EXISTS session_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tokens_used INTEGER NOT NULL DEFAULT 0,
  cost DECIMAL(10, 4) NOT NULL DEFAULT 0,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT session_usage_tokens_positive CHECK (tokens_used >= 0),
  CONSTRAINT session_usage_cost_positive CHECK (cost >= 0)
);

CREATE INDEX IF NOT EXISTS idx_session_usage_user_id ON session_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_session_usage_timestamp ON session_usage(timestamp);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'overdue')),
  stripe_invoice_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT invoices_amount_positive CHECK (amount >= 0)
);

CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at);

-- Unique index on users.email (if not exists)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- RLS policies (adjust as needed for your auth setup)
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Plans: readable by all authenticated users
CREATE POLICY "Plans are viewable by authenticated users" ON plans
  FOR SELECT TO authenticated USING (true);

-- Subscriptions: users can only see their own
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Session usage: users can only see their own
CREATE POLICY "Users can view own session usage" ON session_usage
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Invoices: users can only see their own
CREATE POLICY "Users can view own invoices" ON invoices
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
