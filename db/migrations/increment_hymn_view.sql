-- Create a function to increment hymn view count
CREATE OR REPLACE FUNCTION increment_hymn_view(hymn_id UUID, user_id UUID DEFAULT NULL)
RETURNS void
SECURITY DEFINER
AS $$
DECLARE
  current_count INT;
  current_date DATE := CURRENT_DATE;
  current_timestamp TIMESTAMP WITH TIME ZONE := NOW();
BEGIN
  -- Insert view record
  INSERT INTO hymn_views (hymn_id, user_id, viewed_at, view_date)
  VALUES (hymn_id, user_id, current_timestamp, current_date);
  
  -- Update the hymn's view count and last_viewed_at
  UPDATE hymns_new
  SET 
    view_count = view_count + 1,
    last_viewed_at = current_timestamp
  WHERE id = hymn_id;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for view count
CREATE OR REPLACE FUNCTION update_hymn_view_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the hymn's view count
  UPDATE hymns_new
  SET view_count = view_count + 1,
      last_viewed_at = NEW.viewed_at
  WHERE id = NEW.hymn_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on hymn_views table
CREATE TRIGGER hymn_view_added
AFTER INSERT ON hymn_views
FOR EACH ROW
EXECUTE FUNCTION update_hymn_view_count();

-- Grant access to the function for all users (including anon)
GRANT EXECUTE ON FUNCTION public.increment_hymn_view TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_hymn_view TO anon;
GRANT EXECUTE ON FUNCTION public.increment_hymn_view TO service_role;

COMMENT ON FUNCTION public.increment_hymn_view IS 'Increments the view count for a hymn by 1';
