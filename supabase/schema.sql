-- =============================================
-- CV Tailor Pro — Supabase Schema
-- =============================================
-- Run this in your Supabase SQL Editor

-- 1. Create the cv_generate table
CREATE TABLE IF NOT EXISTS public.cv_generate (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  original_cv_url TEXT,
  new_cv_url      TEXT,
  job_description TEXT NOT NULL,
  latex_code      TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.cv_generate ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Allow anyone to insert (for anonymous usage)
CREATE POLICY "Allow anonymous inserts"
  ON public.cv_generate
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to read their own records (or all if anonymous)
CREATE POLICY "Allow read access"
  ON public.cv_generate
  FOR SELECT
  USING (true);

-- 4. Create Storage Bucket for CV files
INSERT INTO storage.buckets (id, name, public)
VALUES ('cv-files', 'cv-files', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Storage Policies — allow uploads and reads
CREATE POLICY "Allow public uploads to cv-files"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'cv-files');

CREATE POLICY "Allow public reads from cv-files"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'cv-files');

-- 6. Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_cv_generate_created_at
  ON public.cv_generate (created_at DESC);

-- =============================================
-- OPTIONAL: If you want user-based RLS (with auth)
-- Replace the policies above with these:
-- =============================================
-- CREATE POLICY "Users can insert own records"
--   ON public.cv_generate
--   FOR INSERT
--   WITH CHECK (auth.uid() = user_id);
--
-- CREATE POLICY "Users can read own records"
--   ON public.cv_generate
--   FOR SELECT
--   USING (auth.uid() = user_id);
