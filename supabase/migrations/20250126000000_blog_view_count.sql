-- Add view_count column if not exists (user may have added manually)
ALTER TABLE public.blogs
  ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0;

-- Atomic increment function for view counting
CREATE OR REPLACE FUNCTION public.increment_blog_view_count(blog_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE blogs SET view_count = COALESCE(view_count, 0) + 1 WHERE id = blog_id;
$$;

-- Allow anyone to call (public blog views)
GRANT EXECUTE ON FUNCTION public.increment_blog_view_count(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.increment_blog_view_count(uuid) TO authenticated;
