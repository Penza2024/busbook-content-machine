-- BusBook Content Machine — Supabase Migration
-- Run in Supabase SQL Editor or via `supabase migration up`

-- ─── Enable Extensions ─────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Brands / Settings ─────────────────────────────
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'My Brand',
  website_url TEXT DEFAULT '',
  brand_voice TEXT DEFAULT 'Professional yet friendly',
  brand_tone TEXT DEFAULT 'Helpful and confident',
  target_audience TEXT DEFAULT 'Travelers and commuters',
  color_palette TEXT[] DEFAULT '{"#2563EB","#1E40AF"}',
  logo_url TEXT,
  pillars TEXT[] DEFAULT '{"problem-awareness","solution-demo","social-proof","urgency","educational","behind-the-scenes"}',
  platforms JSONB DEFAULT '[
    {"id":"tiktok","name":"TikTok","active":true,"best_practices":{"posting_frequency":"3-5/week","caption_length":150,"format":"vertical-video"}},
    {"id":"youtube","name":"YouTube","active":true,"best_practices":{"posting_frequency":"1-2/week","caption_length":300,"format":"long-video+shorts"}},
    {"id":"instagram","name":"Instagram","active":true,"best_practices":{"posting_frequency":"3-5/week","caption_length":150,"format":"reels+carousels"}},
    {"id":"facebook","name":"Facebook","active":true,"best_practices":{"posting_frequency":"2-3/week","caption_length":250,"format":"posts+groups"}}
  ]'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Content Ideas ─────────────────────────────────
CREATE TABLE content_ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  core_screenshots TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','ready','in-production','published','archived')),
  pillar TEXT DEFAULT 'solution-demo',
  performance_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Repurposed Posts ─────────────────────────────
CREATE TABLE repurposed_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  idea_id UUID NOT NULL REFERENCES content_ideas(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  hook TEXT NOT NULL DEFAULT '',
  caption TEXT DEFAULT '',
  cta TEXT DEFAULT '',
  format TEXT DEFAULT 'reel' CHECK (format IN ('reel','carousel','short','static','story','post')),
  hashtags TEXT[] DEFAULT '{}',
  thumbnail_idea TEXT DEFAULT '',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','scheduled','published','failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Scheduled Posts ──────────────────────────────
CREATE TABLE scheduled_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  repurposed_post_id UUID NOT NULL REFERENCES repurposed_posts(id) ON DELETE CASCADE,
  scheduled_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('draft','scheduled','published','failed')),
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Performance Logs ─────────────────────────────
CREATE TABLE performance_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scheduled_post_id UUID NOT NULL REFERENCES scheduled_posts(id) ON DELETE CASCADE,
  reach INTEGER DEFAULT 0,
  engagement INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  leads INTEGER DEFAULT 0,
  notes TEXT DEFAULT '',
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Indexes ──────────────────────────────────────
CREATE INDEX idx_content_ideas_user ON content_ideas(user_id);
CREATE INDEX idx_content_ideas_brand ON content_ideas(brand_id);
CREATE INDEX idx_repurposed_posts_idea ON repurposed_posts(idea_id);
CREATE INDEX idx_repurposed_posts_platform ON repurposed_posts(platform);
CREATE INDEX idx_scheduled_posts_date ON scheduled_posts(scheduled_date);
CREATE INDEX idx_performance_logs_post ON performance_logs(scheduled_post_id);

-- ─── Row Level Security ───────────────────────────
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE repurposed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_logs ENABLE ROW LEVEL SECURITY;

-- User can only see their own data
CREATE POLICY user_isolation_brands ON brands
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY user_isolation_ideas ON content_ideas
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY user_isolation_repurposed ON repurposed_posts
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY user_isolation_scheduled ON scheduled_posts
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY user_isolation_performance ON performance_logs
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Automatically set user_id on insert
CREATE OR REPLACE FUNCTION set_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER set_brands_user_id BEFORE INSERT ON brands
  FOR EACH ROW EXECUTE FUNCTION set_user_id();
CREATE TRIGGER set_ideas_user_id BEFORE INSERT ON content_ideas
  FOR EACH ROW EXECUTE FUNCTION set_user_id();
CREATE TRIGGER set_repurposed_user_id BEFORE INSERT ON repurposed_posts
  FOR EACH ROW EXECUTE FUNCTION set_user_id();
CREATE TRIGGER set_scheduled_user_id BEFORE INSERT ON scheduled_posts
  FOR EACH ROW EXECUTE FUNCTION set_user_id();
CREATE TRIGGER set_performance_user_id BEFORE INSERT ON performance_logs
  FOR EACH ROW EXECUTE FUNCTION set_user_id();

-- ─── Storage Bucket for Screenshots ───────────────
INSERT INTO storage.buckets (id, name, public) VALUES ('screenshots', 'screenshots', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload screenshots" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'screenshots' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view screenshots" ON storage.objects
  FOR SELECT USING (bucket_id = 'screenshots');
