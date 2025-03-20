-- Create tags table
CREATE TABLE IF NOT EXISTS public.tags (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

-- Add RLS to tags
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- Create posts table
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  hymn_id uuid REFERENCES public.hymns (id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users (id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(content, '')), 'B')
  ) STORED
);

-- Create index for search
CREATE INDEX idx_posts_search_vector ON public.posts USING GIN (search_vector);

-- Add RLS to posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Create comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id uuid REFERENCES public.posts (id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users (id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

-- Add RLS to comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Create likes table
CREATE TABLE IF NOT EXISTS public.likes (
  user_id uuid REFERENCES auth.users (id) ON DELETE CASCADE NOT NULL,
  post_id uuid REFERENCES public.posts (id) ON DELETE CASCADE,
  comment_id uuid REFERENCES public.comments (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, COALESCE(post_id, uuid_nil()), COALESCE(comment_id, uuid_nil())),
  CONSTRAINT either_post_or_comment CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR 
    (post_id IS NULL AND comment_id IS NOT NULL)
  )
);

-- Add RLS to likes
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- Create post_tags junction table
CREATE TABLE IF NOT EXISTS public.post_tags (
  post_id uuid REFERENCES public.posts (id) ON DELETE CASCADE NOT NULL,
  tag_id uuid REFERENCES public.tags (id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  PRIMARY KEY (post_id, tag_id)
);

-- Add RLS to post_tags
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;

-- Auto-update updated_at columns
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_posts_updated_at
BEFORE UPDATE ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
BEFORE UPDATE ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Set up RLS policies

-- Tags policies (anyone can read, only authenticated users can create)
CREATE POLICY "Anyone can read tags"
ON public.tags
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create tags"
ON public.tags
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Posts policies
CREATE POLICY "Anyone can read posts"
ON public.posts
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create posts"
ON public.posts
FOR INSERT
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
ON public.posts
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
ON public.posts
FOR DELETE
USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Anyone can read comments"
ON public.comments
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create comments"
ON public.comments
FOR INSERT
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
ON public.comments
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON public.comments
FOR DELETE
USING (auth.uid() = user_id);

-- Likes policies
CREATE POLICY "Anyone can read likes"
ON public.likes
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create/delete likes"
ON public.likes
FOR ALL
USING (auth.uid() = user_id);

-- Post tags policies
CREATE POLICY "Anyone can read post_tags"
ON public.post_tags
FOR SELECT
USING (true);

CREATE POLICY "Post authors can manage post tags"
ON public.post_tags
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.posts
    WHERE posts.id = post_tags.post_id
    AND posts.user_id = auth.uid()
  )
);
