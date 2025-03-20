/*
  # Initial Schema Setup for Hymn Management System

  1. New Tables
    - `authors`
      - `id` (uuid, primary key)
      - `name` (text)
      - `biography` (text)
      - `created_at` (timestamp)
    
    - `hymns`
      - `id` (uuid, primary key)
      - `title` (text)
      - `author_id` (uuid, foreign key)
      - `lyrics` (text)
      - `pdf_url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - Full-text search enabled on title and lyrics

  2. Security
    - Enable RLS on both tables
    - Public read access
    - Authenticated users can manage content
*/

-- Create authors table
CREATE TABLE authors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  biography text,
  created_at timestamptz DEFAULT now()
);

-- Create hymns table
CREATE TABLE hymns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author_id uuid REFERENCES authors(id) ON DELETE CASCADE,
  lyrics text NOT NULL,
  pdf_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(lyrics, '')), 'B')
  ) STORED
);

-- Create index for full-text search
CREATE INDEX hymns_search_idx ON hymns USING GIN (search_vector);

-- Enable Row Level Security
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE hymns ENABLE ROW LEVEL SECURITY;

-- Create policies for authors
CREATE POLICY "Allow public read access on authors"
  ON authors
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to manage authors"
  ON authors
  USING (auth.role() = 'authenticated');

-- Create policies for hymns
CREATE POLICY "Allow public read access on hymns"
  ON hymns
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to manage hymns"
  ON hymns
  USING (auth.role() = 'authenticated');