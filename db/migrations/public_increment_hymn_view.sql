-- Function to safely increment hymn views without requiring authentication
CREATE OR REPLACE FUNCTION public.public_increment_hymn_view(hymn_id UUID)
RETURNS void AS $$
BEGIN
    -- Only update the hymn's view count, don't create a view record
    UPDATE hymns_new
    SET 
        view_count = COALESCE(view_count, 0) + 1,
        last_viewed_at = NOW()
    WHERE id = hymn_id;
    
    -- Return nothing
    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to anonymous users
GRANT EXECUTE ON FUNCTION public.public_increment_hymn_view TO anon;
