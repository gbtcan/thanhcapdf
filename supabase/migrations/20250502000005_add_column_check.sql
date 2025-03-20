-- Add helper RPC function to check if a column exists in a table

CREATE OR REPLACE FUNCTION check_column_exists(table_name TEXT, column_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = check_column_exists.table_name
    AND column_name = check_column_exists.column_name
  );
END;
$$;

-- Make the function accessible to authenticated users
GRANT EXECUTE ON FUNCTION check_column_exists TO authenticated;
GRANT EXECUTE ON FUNCTION check_column_exists TO anon;

-- Fix hymn_views table to allow null user_id if it doesn't already
DO $$
BEGIN
  ALTER TABLE public.hymn_views ALTER COLUMN user_id DROP NOT NULL;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Error altering hymn_views table: %', SQLERRM;
END $$;
