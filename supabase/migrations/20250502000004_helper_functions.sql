-- Add helper RPC functions to check if tables exist 

CREATE OR REPLACE FUNCTION check_table_exists(table_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = check_table_exists.table_name
  );
END;
$$;

-- Make the function accessible to authenticated users
GRANT EXECUTE ON FUNCTION check_table_exists TO authenticated;
GRANT EXECUTE ON FUNCTION check_table_exists TO anon;
