-- Script to verify the database schema matches our code expectations

-- Check if hymn_authors table exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'hymn_authors'
  ) THEN
    RAISE EXCEPTION 'Table hymn_authors does not exist';
  END IF;
END
$$;

-- Check if the hymn_authors structure is as expected
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'hymn_authors' AND column_name = 'hymn_id'
  ) THEN
    RAISE EXCEPTION 'Column hymn_id does not exist in hymn_authors';
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'hymn_authors' AND column_name = 'author_id'
  ) THEN
    RAISE EXCEPTION 'Column author_id does not exist in hymn_authors';
  END IF;
END
$$;

-- Verify indexes for performance
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_indexes
    WHERE tablename = 'hymns' AND indexname = 'idx_hymns_search'
  ) THEN
    CREATE INDEX idx_hymns_search ON hymns USING gin(search_vector);
    RAISE NOTICE 'Created missing index idx_hymns_search';
  END IF;
END
$$;

SELECT 'Schema verification complete. Structure is valid.' as result;
