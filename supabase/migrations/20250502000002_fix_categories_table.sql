-- Fix categories table if it doesn't exist or is incorrectly named

-- First check if the table exists
DO $$
BEGIN
  -- Create categories table if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    AND table_name = 'categories'
  ) THEN
    -- Create categories table
    CREATE TABLE public.categories (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      name text NOT NULL,
      description text,
      slug text UNIQUE,
      created_at timestamptz NOT NULL DEFAULT NOW(),
      updated_at timestamptz NOT NULL DEFAULT NOW()
    );

    -- Enable RLS
    ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Everyone can read categories"
      ON public.categories FOR SELECT
      TO anon, authenticated
      USING (true);

    CREATE POLICY "Only administrators can edit categories"
      ON public.categories FOR ALL
      TO authenticated
      USING (
        auth.uid() IN (
          SELECT id FROM users WHERE role IN ('administrator', 'moderator')
        )
      );
      
    -- Create hymn_categories junction table if needed
    CREATE TABLE IF NOT EXISTS public.hymn_categories (
      hymn_id uuid REFERENCES public.hymns(id) ON DELETE CASCADE,
      category_id uuid REFERENCES public.categories(id) ON DELETE CASCADE,
      PRIMARY KEY (hymn_id, category_id)
    );
    
    -- Enable RLS on junction table
    ALTER TABLE public.hymn_categories ENABLE ROW LEVEL SECURITY;
    
    -- Create policies on junction table
    CREATE POLICY "Everyone can read hymn_categories"
      ON public.hymn_categories FOR SELECT
      TO anon, authenticated
      USING (true);
      
    CREATE POLICY "Only administrators can edit hymn_categories"
      ON public.hymn_categories FOR ALL
      TO authenticated
      USING (
        auth.uid() IN (
          SELECT id FROM users WHERE role IN ('administrator', 'moderator')
        )
      );
  END IF;
END $$;
