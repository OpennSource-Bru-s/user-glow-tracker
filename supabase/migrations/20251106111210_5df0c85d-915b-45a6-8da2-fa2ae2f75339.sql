-- Create users table for activity tracking
CREATE TABLE public.tracked_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive')),
  last_active_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tracked_users ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for demo purposes)
CREATE POLICY "Anyone can view users"
  ON public.tracked_users
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert users"
  ON public.tracked_users
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update users"
  ON public.tracked_users
  FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete users"
  ON public.tracked_users
  FOR DELETE
  USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_tracked_users_updated_at
  BEFORE UPDATE ON public.tracked_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();