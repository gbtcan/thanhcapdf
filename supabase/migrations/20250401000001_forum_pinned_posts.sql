-- Add is_pinned column to posts table
ALTER TABLE public.posts 
ADD COLUMN is_pinned BOOLEAN DEFAULT FALSE;

-- Add is_featured column to posts table  
ALTER TABLE public.posts
ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;

-- Create index for faster retrieval of pinned posts
CREATE INDEX idx_posts_is_pinned ON public.posts(is_pinned) 
WHERE is_pinned = TRUE;

-- Create index for faster retrieval of featured posts  
CREATE INDEX idx_posts_is_featured ON public.posts(is_featured)
WHERE is_featured = TRUE;

-- Allow administrators to pin and feature posts
CREATE POLICY "Administrators can pin posts" 
ON public.posts
FOR UPDATE
USING (auth.jwt() ->> 'role' = 'administrator')
WITH CHECK (auth.jwt() ->> 'role' = 'administrator');
