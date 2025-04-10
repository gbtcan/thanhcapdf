-- This file contains all the necessary functions for view counting

-- Function to increment view count directly
CREATE OR REPLACE FUNCTION public.increment_hymn_view(hymn_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.hymns_new
  SET view_count = COALESCE(view_count, 0) + 1
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

-- Add helpful comments
COMMENT ON FUNCTION public.increment_hymn_view IS 'Increments the view count for a hymn by 1';
COMMENT ON FUNCTION public.calculate_new_view_count IS 'Returns current view_count plus one for a hymn';

-- Function to increment a view count safely in concurrent environment
CREATE OR REPLACE FUNCTION increment_count(row_id UUID, table_name TEXT, count_column TEXT)
RETURNS INT
SECURITY DEFINER
AS $$
DECLARE
    current_count INT;
    new_count INT;
BEGIN
    -- Get current count
    EXECUTE format('SELECT %I FROM %I WHERE id = $1', count_column, table_name)
    INTO current_count
    USING row_id;
    
    -- Calculate new count
    new_count := COALESCE(current_count, 0) + 1;
    
    -- Update count
    EXECUTE format('UPDATE %I SET %I = $1 WHERE id = $2', table_name, count_column)
    USING new_count, row_id;
    
    RETURN new_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get related hymns by theme and tag
CREATE OR REPLACE FUNCTION get_related_hymns(
    p_hymn_id UUID,
    p_theme_ids UUID[],
    p_tag_ids UUID[],
    p_limit INT DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    view_count INT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    authors JSONB,
    score INT
)
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH theme_matches AS (
        SELECT h.id, COUNT(*) AS theme_count
        FROM hymns_new h
        JOIN hymn_themes ht ON h.id = ht.hymn_id
        WHERE 
            h.id != p_hymn_id AND 
            h.status = 'published' AND 
            ht.theme_id = ANY(p_theme_ids)
        GROUP BY h.id
    ),
    tag_matches AS (
        SELECT h.id, COUNT(*) AS tag_count
        FROM hymns_new h
        JOIN hymn_tags ht ON h.id = ht.hymn_id
        WHERE 
            h.id != p_hymn_id AND 
            h.status = 'published' AND 
            ht.tag_id = ANY(p_tag_ids)
        GROUP BY h.id
    ),
    scores AS (
        SELECT 
            h.id,
            h.title,
            h.view_count,
            h.created_at,
            h.updated_at,
            COALESCE(tm.theme_count, 0) * 3 + COALESCE(tg.tag_count, 0) AS score,
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'id', a.id,
                    'name', a.name
                )
            ) AS authors
        FROM hymns_new h
        LEFT JOIN theme_matches tm ON h.id = tm.id
        LEFT JOIN tag_matches tg ON h.id = tg.id
        LEFT JOIN hymn_authors ha ON h.id = ha.hymn_id
        LEFT JOIN authors a ON ha.author_id = a.id
        WHERE 
            h.id != p_hymn_id AND
            h.status = 'published' AND
            (tm.id IS NOT NULL OR tg.id IS NOT NULL)
        GROUP BY h.id, tm.theme_count, tg.tag_count
        ORDER BY 
            COALESCE(tm.theme_count, 0) * 3 + COALESCE(tg.tag_count, 0) DESC,
            h.view_count DESC
        LIMIT p_limit
    )
    SELECT * FROM scores;
    
    -- If not enough related hymns, fill with popular hymns
    IF (SELECT COUNT(*) FROM scores) < p_limit THEN
        RETURN QUERY
        SELECT 
            h.id, 
            h.title, 
            h.view_count, 
            h.created_at, 
            h.updated_at,
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'id', a.id,
                    'name', a.name
                )
            ) AS authors,
            0 AS score
        FROM hymns_new h
        LEFT JOIN hymn_authors ha ON h.id = ha.hymn_id
        LEFT JOIN authors a ON ha.author_id = a.id
        WHERE 
            h.id != p_hymn_id AND 
            h.status = 'published' AND
            h.id NOT IN (SELECT id FROM scores)
        GROUP BY h.id
        ORDER BY h.view_count DESC
        LIMIT (p_limit - (SELECT COUNT(*) FROM scores));
    END IF;
END;
$$ LANGUAGE plpgsql;
