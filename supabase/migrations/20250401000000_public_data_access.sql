-- Allow anonymous access to hymns table
CREATE POLICY "Allow anonymous access to hymns"
ON public.hymns
FOR SELECT
USING (true);

-- Allow anonymous access to authors table
CREATE POLICY "Allow anonymous access to authors"
ON public.authors
FOR SELECT
USING (true);

-- Allow anonymous access to categories table
CREATE POLICY "Allow anonymous access to categories"
ON public.categories
FOR SELECT
USING (true);

-- Allow anonymous access to hymn_authors table
CREATE POLICY "Allow anonymous access to hymn_authors"
ON public.hymn_authors
FOR SELECT
USING (true);

-- Allow anonymous access to hymn_categories table
CREATE POLICY "Allow anonymous access to hymn_categories"
ON public.hymn_categories
FOR SELECT
USING (true);

-- Create helper function to setup public access
CREATE OR REPLACE FUNCTION setup_public_access(tables text[])
RETURNS boolean
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY tables
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format(
      'CREATE POLICY IF NOT EXISTS "Allow anonymous access to %I" ON %I FOR SELECT USING (true)',
      tbl, tbl
    );
  END LOOP;
  
  RETURN true;
END;
$$;
