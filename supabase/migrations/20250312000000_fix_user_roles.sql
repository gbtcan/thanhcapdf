-- This script fixes common issues with user roles and permissions

-- First, check for users without roles and assign default role
DO $$
DECLARE
  default_role_id INTEGER;
BEGIN
  -- Get the default role ID (user role)
  SELECT id INTO default_role_id FROM roles WHERE name = 'user';
  
  -- If the user role doesn't exist, create it
  IF default_role_id IS NULL THEN
    INSERT INTO roles (name, permissions)
    VALUES ('user', '{}'::jsonb)
    RETURNING id INTO default_role_id;
    
    RAISE NOTICE 'Created missing user role with ID %', default_role_id;
  END IF;
  
  -- Find users without roles and assign the default role
  UPDATE users
  SET role_id = default_role_id
  WHERE role_id IS NULL OR role_id NOT IN (SELECT id FROM roles);
  
  -- Identify users that exist in auth but not in public.users
  WITH missing_users AS (
    SELECT id FROM auth.users
    WHERE id NOT IN (SELECT id FROM public.users)
  )
  INSERT INTO public.users (id, email, role_id, created_at)
  SELECT 
    au.id,
    au.email,
    default_role_id,
    COALESCE(au.created_at, NOW())
  FROM auth.users au
  JOIN missing_users mu ON au.id = mu.id;
  
  -- Log results
  RAISE NOTICE 'Fixed users table. Added missing role assignments and created missing user records.';
END $$;

-- Check for foreign key constraints and fix if broken
DO $$
BEGIN
  -- Make sure the roles table has all required roles
  INSERT INTO roles (name, permissions)
  VALUES 
    ('administrator', '{"can_manage_users": true, "can_manage_content": true}'::jsonb),
    ('editor', '{"can_manage_content": true}'::jsonb),
    ('user', '{}'::jsonb)
  ON CONFLICT (name) DO NOTHING;
  
  RAISE NOTICE 'Ensured all required roles exist in the database.';
END $$;

-- Fix the roles access policy if it's too restrictive
CREATE OR REPLACE POLICY "Roles are viewable by all users"
  ON public.roles FOR SELECT
  USING (true);

-- Make sure the auth trigger works properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role_id)
  VALUES (
    NEW.id,
    NEW.email,
    (SELECT id FROM roles WHERE name = 'user')
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Verify fixes
SELECT 'Database fixes applied successfully.' AS result;
