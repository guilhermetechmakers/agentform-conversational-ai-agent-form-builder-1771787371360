-- Agent Builder schema for AgentForm
-- Run when Supabase is configured

-- Agents table
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  appearance JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'unpublished')),
  url_token TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agents_owner_id ON agents (owner_id);
CREATE INDEX IF NOT EXISTS idx_agents_owner_status ON agents (owner_id, status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_agents_url_token ON agents (url_token) WHERE url_token IS NOT NULL;

-- Fields table
CREATE TABLE IF NOT EXISTS agent_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('text', 'email', 'phone', 'number', 'date', 'select', 'multiselect', 'textarea')),
  label TEXT NOT NULL,
  validation_rules JSONB DEFAULT '{}'::jsonb,
  "order" INTEGER NOT NULL DEFAULT 0,
  conditional_logic JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_fields_agent_id ON agent_fields (agent_id);

-- Persona table
CREATE TABLE IF NOT EXISTS agent_persona (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL UNIQUE REFERENCES agents(id) ON DELETE CASCADE,
  name TEXT,
  instructions TEXT,
  tone TEXT CHECK (tone IN ('formal', 'friendly', 'sales-y')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_persona_agent_id ON agent_persona (agent_id);

-- Contextual docs table
CREATE TABLE IF NOT EXISTS contextual_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('rich_text', 'pdf', 'url', 'faq')),
  content TEXT,
  url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contextual_docs_agent_id ON contextual_docs (agent_id);

-- Publish settings table
CREATE TABLE IF NOT EXISTS agent_publish_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL UNIQUE REFERENCES agents(id) ON DELETE CASCADE,
  url_token TEXT,
  expiry TIMESTAMPTZ,
  password TEXT,
  webhook_url TEXT,
  webhook_headers JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_publish_settings_agent_id ON agent_publish_settings (agent_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER agent_fields_updated_at
  BEFORE UPDATE ON agent_fields
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER agent_persona_updated_at
  BEFORE UPDATE ON agent_persona
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER contextual_docs_updated_at
  BEFORE UPDATE ON contextual_docs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER agent_publish_settings_updated_at
  BEFORE UPDATE ON agent_publish_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
