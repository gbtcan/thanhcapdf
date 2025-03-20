-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own data" ON "public"."users";
DROP POLICY IF EXISTS "Everyone can view role names" ON "public"."roles";

-- Create policies for the users table
CREATE POLICY "Users can view their own data"
ON "public"."users"
FOR SELECT
USING (
  auth.uid() = id
);

-- Create policies for the roles table
CREATE POLICY "Everyone can view role names"
ON "public"."roles"
FOR SELECT
USING (
  true
);

-- Make sure RLS is enabled for both tables
ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."roles" ENABLE ROW LEVEL SECURITY;
