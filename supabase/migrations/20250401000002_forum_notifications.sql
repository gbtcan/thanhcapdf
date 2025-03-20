-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  comment_id uuid REFERENCES public.comments(id) ON DELETE CASCADE,
  type text NOT NULL,
  read boolean DEFAULT FALSE,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

-- Add index for faster retrieval of notifications by user
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);

-- Add index for unread notifications
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, read) 
WHERE read = FALSE;

-- Add RLS to notifications table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for notifications
CREATE POLICY "Users can read their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Administrators can manage all notifications"
ON public.notifications
FOR ALL
USING (auth.jwt() ->> 'role' = 'administrator');

-- Allow notifications to be created by anyone (for system notifications)
CREATE POLICY "Allow notification creation"
ON public.notifications
FOR INSERT
WITH CHECK (true);
