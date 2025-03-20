-- Base schema for Catholic Hymns App
-- This migration creates all required tables with proper relationships

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Roles for users
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    permissions JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default roles
INSERT INTO roles (name, permissions) VALUES
('administrator', '{"manage_users": true, "manage_content": true, "manage_system": true}'),
('editor', '{"manage_content": true}'),
('standard', '{"create_favorites": true, "view_premium": true}'),
('anonymous', '{"view_public": true}');

-- Users reference table (linked with auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT NOT NULL,
    role_id INTEGER REFERENCES roles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User profiles
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES users(id),
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    website TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- User roles junction table
CREATE TABLE user_roles (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, role_id)
);

-- Authors table
CREATE TABLE authors (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    biography TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Categories table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Hymns table with UUID primary key
CREATE TABLE hymns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    lyrics TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Junction table for hymns and authors (many-to-many)
CREATE TABLE hymn_authors (
    id SERIAL PRIMARY KEY,
    hymn_id UUID NOT NULL REFERENCES hymns(id) ON DELETE CASCADE,
    author_id INTEGER NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
    UNIQUE(hymn_id, author_id)
);

-- Junction table for hymns and categories (many-to-many)
CREATE TABLE hymn_categories (
    id SERIAL PRIMARY KEY,
    hymn_id UUID NOT NULL REFERENCES hymns(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE(hymn_id, category_id)
);

-- PDF files associated with hymns
CREATE TABLE pdf_files (
    id SERIAL PRIMARY KEY,
    hymn_id UUID NOT NULL REFERENCES hymns(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- User favorites
CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hymn_id UUID NOT NULL REFERENCES hymns(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, hymn_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_hymns_title ON hymns(title);
CREATE INDEX idx_authors_name ON authors(name);
CREATE INDEX idx_categories_name ON categories(name);
CREATE INDEX idx_hymn_authors_hymn_id ON hymn_authors(hymn_id);
CREATE INDEX idx_hymn_authors_author_id ON hymn_authors(author_id);
CREATE INDEX idx_hymn_categories_hymn_id ON hymn_categories(hymn_id);
CREATE INDEX idx_hymn_categories_category_id ON hymn_categories(category_id);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_hymn_id ON favorites(hymn_id);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);

-- Enable Row-Level Security (RLS) on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE hymns ENABLE ROW LEVEL SECURITY;
ALTER TABLE hymn_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE hymn_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdf_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Create functions for handling user creation/authentication
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- First create entry in users table
  INSERT INTO public.users (id, email, role_id)
  VALUES (new.id, new.email, (SELECT id FROM roles WHERE name = 'standard'));
  
  -- Then create a profile
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  
  -- Add standard role to user_roles
  INSERT INTO public.user_roles (user_id, role_id)
  VALUES (new.id, (SELECT id FROM roles WHERE name = 'standard'));
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to handle new user signups
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Default policies for public access to most tables
CREATE POLICY "Allow public read access to hymns" ON hymns FOR SELECT USING (true);
CREATE POLICY "Allow public read access to authors" ON authors FOR SELECT USING (true);
CREATE POLICY "Allow public read access to categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access to hymn_authors" ON hymn_authors FOR SELECT USING (true);
CREATE POLICY "Allow public read access to hymn_categories" ON hymn_categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access to pdf_files" ON pdf_files FOR SELECT USING (true);

-- Editor can insert/update hymns
CREATE POLICY "Editors can insert hymns" ON hymns
FOR INSERT WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM users 
    JOIN roles ON users.role_id = roles.id 
    WHERE roles.name IN ('editor', 'administrator')
  )
);

CREATE POLICY "Editors can update hymns" ON hymns
FOR UPDATE USING (
  auth.uid() IN (
    SELECT user_id FROM users 
    JOIN roles ON users.role_id = roles.id 
    WHERE roles.name IN ('editor', 'administrator')
  )
);

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_hymn_modtime
BEFORE UPDATE ON hymns
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_author_modtime
BEFORE UPDATE ON authors
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_category_modtime
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_pdf_file_modtime
BEFORE UPDATE ON pdf_files
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_user_modtime
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
