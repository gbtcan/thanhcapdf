-- Create bookmarks table
CREATE TABLE public.bookmarks (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (user_id, post_id)
);

-- Enable RLS on bookmarks
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- Add policy for viewing bookmarks
CREATE POLICY "Users can view their own bookmarks"
ON public.bookmarks
FOR SELECT
USING (auth.uid() = user_id);

-- Add policy for managing bookmarks
CREATE POLICY "Users can manage their own bookmarks"
ON public.bookmarks
FOR ALL
USING (auth.uid() = user_id);
