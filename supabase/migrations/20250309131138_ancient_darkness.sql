/*
  # Initial Schema Setup for Catholic Hymns Application

  1. Tables Created:
    - users (extends auth.users)
    - songs
    - authors
    - categories
    - song_authors
    - song_categories
    - comments
    - pdf_files

  2. Security:
    - RLS policies for each table
    - Role-based access control
    - Public/authenticated access rules

  3. Indexes:
    - Full-text search on songs
    - Foreign key relationships
    - Performance optimizations
*/

-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create custom types for user roles
CREATE TYPE user_role AS ENUM ('administrator', 'editor', 'user');

-- Create users table that extends auth.users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role user_role DEFAULT 'user'::user_role,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create songs table with full-text search
CREATE TABLE IF NOT EXISTS songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  lyrics TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  version INTEGER DEFAULT 1,
  search_vector TSVECTOR GENERATED ALWAYS AS (
    setweight(to_tsvector('english', title), 'A') ||
    setweight(to_tsvector('english', lyrics), 'B')
  ) STORED
);

-- Create authors table
CREATE TABLE IF NOT EXISTS authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create song_authors junction table
CREATE TABLE IF NOT EXISTS song_authors (
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
  author_id UUID REFERENCES authors(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (song_id, author_id)
);

-- Create song_categories junction table
CREATE TABLE IF NOT EXISTS song_categories (
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (song_id, category_id)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create pdf_files table
CREATE TABLE IF NOT EXISTS pdf_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_songs_search ON songs USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_songs_created_at ON songs(created_at);
CREATE INDEX IF NOT EXISTS idx_comments_song_id ON comments(song_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_pdf_files_song_id ON pdf_files(song_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE song_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE song_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdf_files ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can manage all users"
  ON users
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'administrator');

-- Create policies for songs table
CREATE POLICY "Anyone can view songs"
  ON songs
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Editors and admins can manage songs"
  ON songs
  USING (
    auth.jwt() ->> 'role' IN ('administrator', 'editor')
  );

-- Create policies for authors table
CREATE POLICY "Anyone can view authors"
  ON authors
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Editors and admins can manage authors"
  ON authors
  USING (
    auth.jwt() ->> 'role' IN ('administrator', 'editor')
  );

-- Create policies for categories table
CREATE POLICY "Anyone can view categories"
  ON categories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Editors and admins can manage categories"
  ON categories
  USING (
    auth.jwt() ->> 'role' IN ('administrator', 'editor')
  );

-- Create policies for comments table
CREATE POLICY "Anyone can view approved comments"
  ON comments
  FOR SELECT
  TO public
  USING (is_approved = true);

CREATE POLICY "Users can create comments"
  ON comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own comments"
  ON comments
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all comments"
  ON comments
  USING (auth.jwt() ->> 'role' = 'administrator');

-- Create policies for pdf_files table
CREATE POLICY "Anyone can view PDF files"
  ON pdf_files
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Editors and admins can manage PDF files"
  ON pdf_files
  USING (
    auth.jwt() ->> 'role' IN ('administrator', 'editor')
  );

-- Create function to handle user role updates
CREATE OR REPLACE FUNCTION handle_user_role_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for user role updates
CREATE TRIGGER user_role_update
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION handle_user_role_update();