/*
  # User Management System Setup
  
  This migration:
  1. Creates a roles table if it doesn't exist
  2. Creates a proper users table that extends auth.users
  3. Sets up appropriate relationships and constraints
  4. Adds RLS policies for security
*/

-- Create roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  permissions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_role_name CHECK (name IN ('administrator', 'editor', 'user'))
);

-- Insert default roles if they don't exist
INSERT INTO roles (name, permissions)
VALUES 
  ('administrator', '{"can_manage_users": true, "can_manage_content": true}'::jsonb),
  ('editor', '{"can_manage_content": true}'::jsonb),
  ('user', '{}'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- Create users table that extends auth.users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT NOT NULL,
  role_id INTEGER REFERENCES roles(id) DEFAULT (SELECT id FROM roles WHERE name = 'user'),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Drop column if it exists (to prevent issues if previous migrations created a 'role' column)
DO $$ 
BEGIN 
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role') THEN
    ALTER TABLE users DROP COLUMN role;
  END IF;
END $$;

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Enable Row Level Security
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for roles table
CREATE POLICY "Roles viewable by all authenticated users"
  ON roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Roles manageable only by administrators"
  ON roles FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND role_id = (SELECT id FROM roles WHERE name = 'administrator')
  ));

-- Create RLS policies for users table
CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Administrators can view all user data"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND role_id = (SELECT id FROM roles WHERE name = 'administrator')
    )
  );

CREATE POLICY "Administrators can manage all user data"
  ON users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND role_id = (SELECT id FROM roles WHERE name = 'administrator')
    )
  );

-- Create a function to update users when they register
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role_id)
  VALUES (
    NEW.id,
    NEW.email,
    (SELECT id FROM roles WHERE name = 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Create function to handle user updates
CREATE OR REPLACE FUNCTION handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for user updates
DROP TRIGGER IF EXISTS on_user_updated ON public.users;
CREATE TRIGGER on_user_updated
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_user_update();
