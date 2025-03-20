-- Create content flags table
CREATE TABLE public.content_flags (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type text NOT NULL CHECK (content_type IN ('post', 'comment')),
  content_id uuid NOT NULL,
  reporter_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reason text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'removed')),
  moderator_note text,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

-- Add index for faster retrieval of pending flags
CREATE INDEX idx_content_flags_status ON public.content_flags(status) 
WHERE status = 'pending';

-- Add compound index for content type and id
CREATE INDEX idx_content_flags_content ON public.content_flags(content_type, content_id);

-- Add RLS to content_flags table
ALTER TABLE public.content_flags ENABLE ROW LEVEL SECURITY;

-- RLS policies for content flags
CREATE POLICY "Users can create content flags"
ON public.content_flags
FOR INSERT
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = reporter_id);

CREATE POLICY "Users can view their own flags"
ON public.content_flags
FOR SELECT
USING (auth.uid() = reporter_id);

CREATE POLICY "Administrators can view and manage all flags"
ON public.content_flags
FOR ALL
USING (auth.jwt() ->> 'role' = 'administrator');
