-- Add reputation field to users table
ALTER TABLE public.users
ADD COLUMN reputation INTEGER DEFAULT 0 NOT NULL;

-- Create forum reputation history table
CREATE TABLE public.reputation_events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_id uuid REFERENCES public.posts(id) ON DELETE SET NULL,
  comment_id uuid REFERENCES public.comments(id) ON DELETE SET NULL,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on reputation events
ALTER TABLE public.reputation_events ENABLE ROW LEVEL SECURITY;

-- Add policy for viewing reputation events
CREATE POLICY "Users can view their own reputation events"
ON public.reputation_events
FOR SELECT
USING (auth.uid() = user_id);

-- Update the update_user_reputation function
CREATE OR REPLACE FUNCTION public.update_user_reputation()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the user's total reputation
  UPDATE public.users
  SET reputation = reputation + NEW.points
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for reputation events
CREATE TRIGGER on_reputation_event
AFTER INSERT ON public.reputation_events
FOR EACH ROW
EXECUTE FUNCTION public.update_user_reputation();
