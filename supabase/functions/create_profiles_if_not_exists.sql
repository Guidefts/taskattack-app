CREATE OR REPLACE FUNCTION create_profiles_if_not_exists()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create profiles table if it doesn't exist
  CREATE TABLE IF NOT EXISTS profiles (
    id uuid references auth.users on delete cascade primary key,
    email text unique not null,
    name text,
    avatar_url text,
    created_at timestamptz default now()
  );

  -- Enable RLS
  ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

  -- Create policies if they don't exist
  DO $$ 
  BEGIN
    IF NOT EXISTS (
      SELECT FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view own profile'
    ) THEN
      CREATE POLICY "Users can view own profile"
        ON profiles FOR SELECT
        USING (auth.uid() = id);
    END IF;

    IF NOT EXISTS (
      SELECT FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update own profile'
    ) THEN
      CREATE POLICY "Users can update own profile"
        ON profiles FOR UPDATE
        USING (auth.uid() = id);
    END IF;
  END $$;

  -- Create trigger for new user creation if it doesn't exist
  CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $$
  BEGIN
    INSERT INTO public.profiles (id, email, name)
    VALUES (new.id, new.email, new.raw_user_meta_data->>'name')
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
  END;
  $$;

  -- Drop and recreate trigger to ensure it's up to date
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
END;
$$;