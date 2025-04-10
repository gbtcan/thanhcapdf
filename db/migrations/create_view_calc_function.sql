-- Function to calculate new view count (usable within update statements)
CREATE OR REPLACE FUNCTION public.calculate_new_view_count(row_id UUID) 
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COALESCE(view_count, 0) + 1
  FROM public.hymns_new
  WHERE id = row_id
$$;

-- Function to create the above function via RPC (for front-end setup)
CREATE OR REPLACE FUNCTION public.create_view_count_calc_function()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Drop if exists then create the function
  DROP FUNCTION IF EXISTS public.calculate_new_view_count(UUID);
  
  CREATE OR REPLACE FUNCTION public.calculate_new_view_count(row_id UUID) 
  RETURNS INTEGER
  LANGUAGE sql
  SECURITY DEFINER
  AS $inner$
    SELECT COALESCE(view_count, 0) + 1
    FROM public.hymns_new
    WHERE id = row_id
  $inner$;
  
  -- Grant access to the function
  GRANT EXECUTE ON FUNCTION public.calculate_new_view_count(UUID) TO authenticated;
  GRANT EXECUTE ON FUNCTION public.calculate_new_view_count(UUID) TO anon;
  GRANT EXECUTE ON FUNCTION public.calculate_new_view_count(UUID) TO service_role;
  
  RETURN TRUE;
END;
$$;

-- Grant access to the creation function
GRANT EXECUTE ON FUNCTION public.create_view_count_calc_function() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_view_count_calc_function() TO service_role;

-- Comment the functions
COMMENT ON FUNCTION public.calculate_new_view_count IS 'Returns current view_count plus one for a hymn';
COMMENT ON FUNCTION public.create_view_count_calc_function IS 'Creates or recreates the calculate_new_view_count function';
