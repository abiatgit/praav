-- Check if loved_items table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'loved_items'
) as table_exists;

-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'loved_items';

-- Check existing functions
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND (routine_name = 'get_loved_items_count' OR routine_name = 'is_listing_loved');
