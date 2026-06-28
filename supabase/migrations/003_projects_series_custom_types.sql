-- BusBook Content Machine — Projects, Series, Custom Content Types
-- Run after 002_enhanced_settings.sql

-- ─── Projects ──────────────────────────────────────
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  slug TEXT NOT NULL,
  brand_voice TEXT DEFAULT 'Professional yet friendly',
  brand_tone TEXT DEFAULT 'Helpful and confident',
  target_audience TEXT DEFAULT '',
  color_palette TEXT[] DEFAULT '{"#2563EB","#1E40AF"}',
  usps TEXT DEFAULT '',
  competitor_mentions TEXT DEFAULT '',
  content_examples TEXT DEFAULT '',
  launch_phase TEXT DEFAULT 'pre-launch' CHECK (launch_phase IN ('pre-launch','launch','growth')),
  pillars TEXT[] DEFAULT '{"problem-awareness","solution-demo"}',
  platforms JSONB DEFAULT '[]'::JSONB,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_isolation_projects ON projects
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TRIGGER set_projects_user_id BEFORE INSERT ON projects
  FOR EACH ROW EXECUTE FUNCTION set_user_id();

CREATE INDEX idx_projects_user ON projects(user_id);

-- ─── Series / Campaigns ────────────────────────────
CREATE TABLE series (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  goal TEXT DEFAULT '',
  total_parts INTEGER DEFAULT 1,
  timeline TEXT DEFAULT '',
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning','active','completed','archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE series ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_isolation_series ON series
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TRIGGER set_series_user_id BEFORE INSERT ON series
  FOR EACH ROW EXECUTE FUNCTION set_user_id();

CREATE INDEX idx_series_project ON series(project_id);

-- ─── Series Items (Episodes / Parts) ───────────────
CREATE TABLE series_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  series_id UUID NOT NULL REFERENCES series(id) ON DELETE CASCADE,
  idea_id UUID REFERENCES content_ideas(id) ON DELETE SET NULL,
  part_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned','in-progress','done')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE series_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_isolation_series_items ON series_items
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TRIGGER set_series_items_user_id BEFORE INSERT ON series_items
  FOR EACH ROW EXECUTE FUNCTION set_user_id();

CREATE INDEX idx_series_items_series ON series_items(series_id);

-- ─── Project ID to existing tables ─────────────────
ALTER TABLE content_ideas ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL;
ALTER TABLE content_ideas ADD COLUMN IF NOT EXISTS series_item_id UUID REFERENCES series_items(id) ON DELETE SET NULL;

ALTER TABLE repurposed_posts ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL;

CREATE INDEX idx_content_ideas_project ON content_ideas(project_id);
CREATE INDEX idx_repurposed_posts_project ON repurposed_posts(project_id);

-- ─── Custom Content Types ──────────────────────────
CREATE TABLE content_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  icon TEXT DEFAULT 'FileText',
  description TEXT DEFAULT '',
  is_builtin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE content_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_isolation_content_types ON content_types
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TRIGGER set_content_types_user_id BEFORE INSERT ON content_types
  FOR EACH ROW EXECUTE FUNCTION set_user_id();

-- Insert built-in content types
INSERT INTO content_types (user_id, name, slug, icon, description, is_builtin)
SELECT
  id,
  'Reel' AS name,
  'reel' AS slug,
  'Video' AS icon,
  'Short-form vertical video' AS description,
  true AS is_builtin
FROM auth.users
ON CONFLICT DO NOTHING;

-- We need to make the user_id nullable for built-in types since they're global
-- Actually, let's make built-in types have user_id = NULL
-- Drop and recreate
DELETE FROM content_types;
ALTER TABLE content_types ALTER COLUMN user_id DROP NOT NULL;

INSERT INTO content_types (user_id, name, slug, icon, description, is_builtin) VALUES
  (NULL, 'Reel', 'reel', 'Video', 'Short-form vertical video', true),
  (NULL, 'Carousel', 'carousel', 'Columns', 'Multi-slide post', true),
  (NULL, 'Short', 'short', 'Video', 'YouTube Shorts', true),
  (NULL, 'Story', 'story', 'Instagram', '24-hour story', true),
  (NULL, 'Post', 'post', 'FileText', 'Standard social post', true),
  (NULL, 'YouTube Video', 'youtube-video', 'Video', 'Long-form YouTube video', true),
  (NULL, 'Blog Post', 'blog-post', 'FileText', 'Blog or article', true),
  (NULL, 'Podcast Episode', 'podcast-episode', 'Mic', 'Audio podcast episode', true),
  (NULL, 'Tweet / Thread', 'thread', 'MessageSquare', 'Twitter/X thread', true),
  (NULL, 'Newsletter', 'newsletter', 'Mail', 'Email newsletter', true);

-- Make format column in repurposed_posts TEXT (remove CHECK constraint so any content type is valid)
ALTER TABLE repurposed_posts ALTER COLUMN format DROP DEFAULT;
ALTER TABLE repurposed_posts ALTER COLUMN format TYPE TEXT;
ALTER TABLE repurposed_posts ALTER COLUMN format SET DEFAULT 'post';
