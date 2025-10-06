-- Fix public.users table schema
-- The current public.users table has the wrong schema (auth.users schema)
-- We need to recreate it with the correct application schema

-- 1. First, let's see what's currently in public.users
SELECT COUNT(*) as current_users_count FROM public.users;

-- 2. Drop the incorrectly structured public.users table
DROP TABLE IF EXISTS public.users CASCADE;

-- 3. Recreate public.users with the correct schema
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  avatar_url TEXT,
  organization_id UUID REFERENCES public.organizations(id),
  role VARCHAR(50) DEFAULT 'volunteer',
  status VARCHAR(20) DEFAULT 'active',
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable RLS on the new users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for the new users table
-- Allow users to insert their own profile during signup
CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT 
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow users to view profiles in their organizations
CREATE POLICY "Users can view profiles in their organizations" ON public.users
  FOR SELECT USING (
    id IN (
      SELECT user_id 
      FROM public.user_memberships 
      WHERE organization_id IN (
        SELECT organization_id 
        FROM public.user_memberships 
        WHERE user_id = auth.uid() 
        AND status = 'active'
      )
    )
  );

-- 6. Create a function to automatically create user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create a trigger to automatically create user profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Verify the new schema
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
   AND table_name = 'users'
ORDER BY ordinal_position;

-- 9. Test the fix
SELECT 'public.users table recreated with correct schema' as status;
