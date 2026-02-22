-- Email Notifications & Alerts Schema
-- Run this migration to create tables for email templates, events, and bounces

-- Extend users table with email subscription status if not exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_subscribed BOOLEAN DEFAULT true;

-- Email templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  subject VARCHAR(500) NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT email_templates_subject_not_null CHECK (subject IS NOT NULL AND length(trim(subject)) > 0),
  CONSTRAINT email_templates_body_not_null CHECK (body IS NOT NULL)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_email_templates_name ON email_templates(name);

-- Email events table (logs email sends)
CREATE TABLE IF NOT EXISTS email_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('signup', 'reset', 'session_completed', 'webhook_failure', 'billing_alert')),
  status VARCHAR(50) NOT NULL CHECK (status IN ('sent', 'delivered', 'bounced', 'failed')),
  message_id VARCHAR(255),
  session_id UUID,
  subject VARCHAR(500),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_events_user_id ON email_events(user_id);
CREATE INDEX IF NOT EXISTS idx_email_events_event_type ON email_events(event_type);
CREATE INDEX IF NOT EXISTS idx_email_events_timestamp ON email_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_email_events_status ON email_events(status);

-- Email bounces table (tracks bounces and unsubscribes)
CREATE TABLE IF NOT EXISTS email_bounces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bounce_type VARCHAR(50) NOT NULL CHECK (bounce_type IN ('hard', 'soft', 'complaint', 'unsubscribe')),
  message_id VARCHAR(255),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_bounces_user_id ON email_bounces(user_id);
CREATE INDEX IF NOT EXISTS idx_email_bounces_timestamp ON email_bounces(timestamp);

-- Search cache table (for search feature - optional, from search spec)
CREATE TABLE IF NOT EXISTS search_cache (
  query VARCHAR(255) PRIMARY KEY,
  results JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies for email tables
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_bounces ENABLE ROW LEVEL SECURITY;

-- Email templates: readable by authenticated users (for display)
CREATE POLICY "Email templates viewable by authenticated" ON email_templates
  FOR SELECT TO authenticated USING (true);

-- Email events: users can only see their own
CREATE POLICY "Users can view own email events" ON email_events
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Email bounces: users can only see their own
CREATE POLICY "Users can view own email bounces" ON email_bounces
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
