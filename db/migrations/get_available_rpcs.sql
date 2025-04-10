-- Function to get available RPCs
CREATE OR REPLACE FUNCTION public.get_available_rpcs()
RETURNS SETOF TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT p.proname::text
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public';
END;
$$;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION public.get_available_rpcs TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_available_rpcs TO service_role;
