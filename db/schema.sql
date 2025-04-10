-- Database schema for ThánhCaPDF application

-- Hymns main table
CREATE TABLE IF NOT EXISTS hymns_new (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  lyrics TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  view_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  search_vector TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('vietnamese', coalesce(title, '')) || 
    to_tsvector('vietnamese', coalesce(lyrics, ''))
  ) STORED
);

-- Authors table
CREATE TABLE IF NOT EXISTS authors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  biography TEXT,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Themes/Categories table
CREATE TABLE IF NOT EXISTS themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Junction tables for many-to-many relationships
CREATE TABLE IF NOT EXISTS hymn_authors (
  hymn_id UUID REFERENCES hymns_new(id) ON DELETE CASCADE,
  author_id UUID REFERENCES authors(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (hymn_id, author_id)
);

CREATE TABLE IF NOT EXISTS hymn_themes (
  hymn_id UUID REFERENCES hymns_new(id) ON DELETE CASCADE,
  theme_id UUID REFERENCES themes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (hymn_id, theme_id)
);

CREATE TABLE IF NOT EXISTS hymn_tags (
  hymn_id UUID REFERENCES hymns_new(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (hymn_id, tag_id)
);

-- PDF files table
CREATE TABLE IF NOT EXISTS hymn_pdf_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hymn_id UUID REFERENCES hymns_new(id) ON DELETE CASCADE,
  pdf_path TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  uploaded_by UUID REFERENCES auth.users(id)
);

-- Audio files table
CREATE TABLE IF NOT EXISTS hymn_audio_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hymn_id UUID REFERENCES hymns_new(id) ON DELETE CASCADE,
  audio_path TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  uploaded_by UUID REFERENCES auth.users(id),
  pdf_id UUID REFERENCES hymn_pdf_files(id) ON DELETE SET NULL
);

-- Video links table
CREATE TABLE IF NOT EXISTS hymn_video_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hymn_id UUID REFERENCES hymns_new(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  source TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  uploaded_by UUID REFERENCES auth.users(id),
  pdf_id UUID REFERENCES hymn_pdf_files(id) ON DELETE SET NULL
);

-- Presentation files table
CREATE TABLE IF NOT EXISTS hymn_presentation_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hymn_id UUID REFERENCES hymns_new(id) ON DELETE CASCADE,
  presentation_url TEXT NOT NULL,
  description TEXT,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  uploaded_by UUID REFERENCES auth.users(id)
);

-- User actions tables
CREATE TABLE IF NOT EXISTS hymn_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hymn_id UUID REFERENCES hymns_new(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hymn_views (
  hymn_id UUID REFERENCES hymns_new(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  view_date DATE DEFAULT CURRENT_DATE
);

-- User profiles and roles
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id INTEGER REFERENCES roles(id) DEFAULT 2
);

-- Insert default roles
INSERT INTO roles (id, name, permissions) 
VALUES 
(1, 'administrator', '{"admin": true, "editor": true}'),
(2, 'user', '{}'),
(3, 'editor', '{"editor": true}')
ON CONFLICT (id) DO NOTHING;
