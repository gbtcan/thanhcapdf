-- Create PDF views table if it doesn't exist

-- Wrap in exception handling block to avoid failures if table already exists
DO $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.pdf_views (
    pdf_id uuid REFERENCES public.pdf_files(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    viewed_at TIMESTAMPTZ DEFAULT NOW(),
    session_id TEXT,
    PRIMARY KEY (pdf_id, viewed_at, COALESCE(user_id::text, session_id, 'anonymous'))
  );
  
  -- Enable RLS on pdf_views table
  ALTER TABLE public.pdf_views ENABLE ROW LEVEL SECURITY;
  
  -- Create policies for PDF views
  CREATE POLICY "Anyone can read PDF views"
  ON public.pdf_views FOR SELECT
  TO anon, authenticated
  USING (true);
  
  CREATE POLICY "Anyone can insert PDF views"
  ON public.pdf_views FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
  
EXCEPTION
  WHEN duplicate_table THEN
    RAISE NOTICE 'pdf_views table already exists, skipping creation';
END $$;

-- Fix session_id column in hymn_views (separate transaction)
DO $$
BEGIN
  -- Check if the session_id column exists, if not, add it
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'hymn_views'
    AND column_name = 'session_id'
  ) THEN
    ALTER TABLE public.hymn_views ADD COLUMN session_id TEXT;
    
    -- Modify the primary key if it exists
    IF EXISTS (
      SELECT 1
      FROM information_schema.table_constraints
      WHERE constraint_name = 'hymn_views_pkey'
      AND table_name = 'hymn_views'
    ) THEN
      ALTER TABLE public.hymn_views DROP CONSTRAINT hymn_views_pkey;
      ALTER TABLE public.hymn_views ADD CONSTRAINT hymn_views_pkey 
        PRIMARY KEY (hymn_id, viewed_at, COALESCE(user_id::text, session_id, 'anonymous'));
    END IF;
  END IF;
  
  -- Try to alter user_id to be nullable
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'hymn_views'
    AND column_name = 'user_id'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.hymn_views ALTER COLUMN user_id DROP NOT NULL;
  END IF;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Error modifying hymn_views: %', SQLERRM;
END $$;
