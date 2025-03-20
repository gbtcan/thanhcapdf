-- Add is_featured column to posts table if it doesn't exist

-- Check if is_featured column exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'posts'
    AND column_name = 'is_featured'
  ) THEN
    -- Add is_featured column to posts table
    ALTER TABLE public.posts ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;
    
    -- Create index for faster filtering of featured posts
    CREATE INDEX idx_posts_is_featured ON public.posts (is_featured) WHERE is_featured = TRUE;
    
    -- Only administrators can mark posts as featured
    CREATE POLICY "Admins can mark posts as featured"
      ON public.posts
      FOR UPDATE
      USING (auth.uid() IN (
        SELECT id FROM public.users WHERE role IN ('administrator', 'moderator')
      ))
      WITH CHECK (auth.uid() IN (
        SELECT id FROM public.users WHERE role IN ('administrator', 'moderator')
      ));
  END IF;
END $$;
