-- Enhance PDF files table with additional metadata
ALTER TABLE public.pdf_files ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.pdf_files ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE public.pdf_files ADD COLUMN IF NOT EXISTS file_type TEXT DEFAULT 'sheet_music';
ALTER TABLE public.pdf_files ADD COLUMN IF NOT EXISTS pages INTEGER;
ALTER TABLE public.pdf_files ADD COLUMN IF NOT EXISTS file_size INTEGER;
ALTER TABLE public.pdf_files ADD COLUMN IF NOT EXISTS uploaded_by uuid REFERENCES auth.users(id);
ALTER TABLE public.pdf_files ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create PDF view count for statistics
CREATE TABLE IF NOT EXISTS public.pdf_views (
  pdf_id uuid REFERENCES public.pdf_files(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (pdf_id, user_id, viewed_at)
);

-- Enable RLS on new table
ALTER TABLE public.pdf_views ENABLE ROW LEVEL SECURITY;

-- Create policies for PDF views
CREATE POLICY "Anyone can insert PDF views" 
ON public.pdf_views FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read PDF views" 
ON public.pdf_views FOR SELECT USING (true);

-- Create function to update file metadata
CREATE OR REPLACE FUNCTION update_pdf_metadata()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the updated_at timestamp
  NEW.updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for updating PDF metadata
CREATE TRIGGER pdf_updated
BEFORE UPDATE ON public.pdf_files
FOR EACH ROW
EXECUTE FUNCTION update_pdf_metadata();

-- Create function to detect PDF metadata automatically
CREATE OR REPLACE FUNCTION process_pdf_upload()
RETURNS TRIGGER AS $$
BEGIN
  -- Here we would ideally extract page count and file size
  -- For now, we'll just set the updated_at time
  NEW.updated_at = NOW();
  
  -- Generate a default description if none is provided
  IF NEW.description IS NULL THEN
    NEW.description = 'Sheet Music';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for new PDF uploads
CREATE TRIGGER process_new_pdf
BEFORE INSERT ON public.pdf_files
FOR EACH ROW
EXECUTE FUNCTION process_pdf_upload();
