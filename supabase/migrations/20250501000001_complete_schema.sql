-- Complete database schema based on requirements

-- Create hymn_views table for tracking view counts
CREATE TABLE IF NOT EXISTS public.hymn_views (
  hymn_id uuid REFERENCES public.hymns (id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  viewed_at timestamptz NOT NULL DEFAULT NOW(),
  PRIMARY KEY (hymn_id, user_id, viewed_at)
);

-- Create index for view counts aggregation
CREATE INDEX idx_hymn_views_hymn_id ON public.hymn_views(hymn_id);

-- Create themes table
CREATE TABLE IF NOT EXISTS public.themes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

-- Create hymn_themes junction table
CREATE TABLE IF NOT EXISTS public.hymn_themes (
  hymn_id uuid REFERENCES public.hymns (id) ON DELETE CASCADE NOT NULL,
  theme_id uuid REFERENCES public.themes (id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  PRIMARY KEY (hymn_id, theme_id)
);

-- Create indexes for hymn_themes lookups
CREATE INDEX idx_hymn_themes_hymn_id ON public.hymn_themes(hymn_id);
CREATE INDEX idx_hymn_themes_theme_id ON public.hymn_themes(theme_id);

-- Create hymn_tags junction table
CREATE TABLE IF NOT EXISTS public.hymn_tags (
  hymn_id uuid REFERENCES public.hymns (id) ON DELETE CASCADE NOT NULL,
  tag_id uuid REFERENCES public.tags (id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  PRIMARY KEY (hymn_id, tag_id)
);

-- Create indexes for hymn_tags lookups
CREATE INDEX idx_hymn_tags_hymn_id ON public.hymn_tags(hymn_id);
CREATE INDEX idx_hymn_tags_tag_id ON public.hymn_tags(tag_id);

-- Create content_flags table for moderation
CREATE TABLE IF NOT EXISTS public.content_flags (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type text NOT NULL CHECK (content_type IN ('post', 'comment')),
  content_id uuid NOT NULL,
  reason text NOT NULL,
  details text,
  reporter_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'removed')),
  moderator_note text,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

-- Add index for content flags
CREATE INDEX idx_content_flags_status ON public.content_flags(status);
CREATE INDEX idx_content_flags_content ON public.content_flags(content_type, content_id);

-- Enable RLS on all tables
ALTER TABLE public.hymn_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hymn_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hymn_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_flags ENABLE ROW LEVEL SECURITY;

-- Create policies for hymn_views
CREATE POLICY "Anyone can insert hymn views" 
ON public.hymn_views FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read hymn views" 
ON public.hymn_views FOR SELECT USING (true);

-- Create policies for themes
CREATE POLICY "Anyone can read themes" 
ON public.themes FOR SELECT USING (true);

CREATE POLICY "Administrators can manage themes" 
ON public.themes USING (auth.jwt() ->> 'role' = 'administrator');

-- Create policies for hymn_themes
CREATE POLICY "Anyone can read hymn_themes" 
ON public.hymn_themes FOR SELECT USING (true);

CREATE POLICY "Administrators can manage hymn_themes" 
ON public.hymn_themes USING (auth.jwt() ->> 'role' = 'administrator');

-- Create policies for hymn_tags
CREATE POLICY "Anyone can read hymn_tags" 
ON public.hymn_tags FOR SELECT USING (true);

CREATE POLICY "Administrators can manage hymn_tags" 
ON public.hymn_tags USING (auth.jwt() ->> 'role' = 'administrator');

-- Create policies for content_flags
CREATE POLICY "Authenticated users can create content flags"
ON public.content_flags FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Administrators can manage content flags"
ON public.content_flags USING (auth.jwt() ->> 'role' = 'administrator');

CREATE POLICY "Users can view their own reports"
ON public.content_flags FOR SELECT USING (auth.uid() = reporter_id);
