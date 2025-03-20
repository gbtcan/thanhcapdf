-- Create reactions table for emoji reactions
CREATE TABLE public.reactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content_type text NOT NULL CHECK (content_type IN ('post', 'comment')),
  content_id uuid NOT NULL,
  type text NOT NULL CHECK (type IN ('like', 'love', 'thanks', 'insightful', 'celebrate')),
  created_at timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, content_type, content_id, type)
);

-- Add index for faster retrieval
CREATE INDEX idx_reactions_content ON public.reactions(content_type, content_id);
CREATE INDEX idx_reactions_user ON public.reactions(user_id);

-- Enable RLS
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can read reactions"
ON public.reactions
FOR SELECT
USING (true);

CREATE POLICY "Users can create/delete their own reactions"
ON public.reactions
FOR ALL
USING (auth.uid() = user_id);

-- Create forum activity view
CREATE OR REPLACE VIEW public.forum_activity_view AS
SELECT 
  p.id,
  p.user_id,
  u.name as user_name,
  u.avatar_url as user_avatar_url,
  p.created_at,
  'post_created' as activity_type,
  p.id as post_id,
  p.title as post_title,
  p.content as content_snippet,
  (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comment_count,
  (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) as like_count
FROM posts p
JOIN users u ON p.user_id = u.id

UNION ALL

SELECT 
  c.id,
  c.user_id,
  u.name as user_name,
  u.avatar_url as user_avatar_url,
  c.created_at,
  'comment_created' as activity_type,
  c.post_id,
  p.title as post_title,
  c.content as content_snippet,
  NULL as comment_count,
  (SELECT COUNT(*) FROM likes l WHERE l.comment_id = c.id) as like_count
FROM comments c
JOIN users u ON c.user_id = u.id
JOIN posts p ON c.post_id = p.id

UNION ALL

SELECT 
  l.id,
  l.user_id,
  u.name as user_name,
  u.avatar_url as user_avatar_url,
  l.created_at,
  CASE
    WHEN l.comment_id IS NULL THEN 'post_liked'
    ELSE 'comment_liked'
  END as activity_type,
  COALESCE(l.post_id, c.post_id) as post_id,
  p.title as post_title,
  NULL as content_snippet,
  NULL as comment_count,
  NULL as like_count
FROM likes l
JOIN users u ON l.user_id = u.id
LEFT JOIN posts p ON l.post_id = p.id
LEFT JOIN comments c ON l.comment_id = c.id
WHERE l.post_id IS NOT NULL OR c.post_id IS NOT NULL;

-- Set permissions on the view
GRANT SELECT ON public.forum_activity_view TO authenticated;
GRANT SELECT ON public.forum_activity_view TO anon;
