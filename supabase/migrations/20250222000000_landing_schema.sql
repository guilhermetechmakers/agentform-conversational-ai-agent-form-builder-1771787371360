-- Landing page database schema for AgentForm
-- Run when Supabase is configured

-- Visitors: track landing page visits
CREATE TABLE IF NOT EXISTS visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  source TEXT,
  landing_page_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_visitors_timestamp ON visitors (timestamp DESC);

-- Signups: track user registrations
CREATE TABLE IF NOT EXISTS signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  source TEXT
);

CREATE INDEX IF NOT EXISTS idx_signups_timestamp ON signups (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_signups_user_id ON signups (user_id);

-- Features: feature list for landing page
CREATE TABLE IF NOT EXISTS features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_path TEXT
);

-- PricingTiers: pricing information
CREATE TABLE IF NOT EXISTS pricing_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  price NUMERIC NOT NULL,
  features_included JSONB DEFAULT '[]'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_pricing_tiers_name ON pricing_tiers (name);

-- Testimonials: customer testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  quote TEXT NOT NULL,
  logo_path TEXT
);
