-- Fix hymn_views table schema to handle anonymous views properly

-- Drop existing constraints if they're causing issues
ALTER TABLE IF EXISTS public.hymn_views 
  DROP CONSTRAINT IF EXISTS hymn_views_user_id_fkey;

-- Modify table to allow null user_id
ALTER TABLE IF EXISTS public.hymn_views 
  ALTER COLUMN user_id DROP NOT NULL;

-- Add a composite primary key that works with null user_id values
ALTER TABLE IF EXISTS public.hymn_views 
  DROP CONSTRAINT IF EXISTS hymn_views_pkey;

-- Create a session_id column for anonymous users
ALTER TABLE IF EXISTS public.hymn_views 
  ADD COLUMN IF NOT EXISTS session_id TEXT;
  
-- New primary key that works for both anonymous and logged-in users
ALTER TABLE IF EXISTS public.hymn_views
  ADD CONSTRAINT hymn_views_pkey 
  PRIMARY KEY (hymn_id, viewed_at, COALESCE(user_id::text, session_id));

-- Add foreign key reference 
ALTER TABLE IF EXISTS public.hymn_views
  ADD CONSTRAINT hymn_views_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Update policies to allow anonymous inserts
DROP POLICY IF EXISTS "Allow anonymous hymn views" ON public.hymn_views;

CREATE POLICY "Allow anonymous hymn views" 
ON public.hymn_views FOR INSERT 
TO anon
WITH CHECK (user_id IS NULL);

-- Policy for authenticated users
DROP POLICY IF EXISTS "Users can record their own views" ON public.hymn_views;

CREATE POLICY "Users can record their own views" 
ON public.hymn_views FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Ensure everyone can select from hymn_views
DROP POLICY IF EXISTS "Everyone can see view counts" ON public.hymn_views;

CREATE POLICY "Everyone can see view counts" 
ON public.hymn_views FOR SELECT 
TO anon, authenticated
USING (true);
