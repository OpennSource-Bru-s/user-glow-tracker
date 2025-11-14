-- Add department, job title, and office columns to tracked_users table
ALTER TABLE public.tracked_users
ADD COLUMN department TEXT,
ADD COLUMN job_title TEXT,
ADD COLUMN office TEXT;