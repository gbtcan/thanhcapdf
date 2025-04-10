-- Database functions for ThánhCaPDF application

-- Function to increment view count directly
CREATE OR REPLACE FUNCTION public.increment_hymn_view(hymn_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.hymns_new
  SET 
    view_count = COALESCE(view_count, 0) + 1,
    last_viewed_at = now()
  WHERE id = hymn_id;
END;
$$;

-- Grant appropriate permissions
GRANT EXECUTE ON FUNCTION public.increment_hymn_view TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_hymn_view TO anon;
GRANT EXECUTE ON FUNCTION public.increment_hymn_view TO service_role;

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

-- Grant appropriate permissions
GRANT EXECUTE ON FUNCTION public.calculate_new_view_count TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_new_view_count TO anon;
GRANT EXECUTE ON FUNCTION public.calculate_new_view_count TO service_role;

-- Function to track view with user id (if available)
CREATE OR REPLACE FUNCTION public.track_hymn_view(hymn_id UUID, user_id UUID DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Increment view count
  UPDATE public.hymns_new
  SET 
    view_count = COALESCE(view_count, 0) + 1,
    last_viewed_at = now()
  WHERE id = hymn_id;
  
  -- Record view in hymn_views table
  INSERT INTO public.hymn_views (hymn_id, user_id)
  VALUES (hymn_id, user_id);
END;
$$;

-- Grant appropriate permissions
GRANT EXECUTE ON FUNCTION public.track_hymn_view TO authenticated;
GRANT EXECUTE ON FUNCTION public.track_hymn_view TO anon;
GRANT EXECUTE ON FUNCTION public.track_hymn_view TO service_role;
