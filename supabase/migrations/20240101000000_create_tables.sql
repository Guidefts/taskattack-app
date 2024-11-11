-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    title TEXT NOT NULL,
    description TEXT,
    group_name TEXT DEFAULT 'Uncategorized',
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    featured BOOLEAN DEFAULT FALSE,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    "order" INTEGER
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can view own tasks"
    ON tasks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tasks"
    ON tasks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
    ON tasks FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
    ON tasks FOR DELETE
    USING (auth.uid() = user_id);

-- Create stored procedures
CREATE OR REPLACE FUNCTION create_profiles_if_not_exists()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Create profiles table if it doesn't exist
    CREATE TABLE IF NOT EXISTS profiles (
        id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        avatar_url TEXT
    );

    -- Enable RLS
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

    -- Create policies
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
END;
$$;

CREATE OR REPLACE FUNCTION create_tasks_if_not_exists()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Create tasks table if it doesn't exist
    CREATE TABLE IF NOT EXISTS tasks (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        title TEXT NOT NULL,
        description TEXT,
        group_name TEXT DEFAULT 'Uncategorized',
        date DATE NOT NULL DEFAULT CURRENT_DATE,
        completed BOOLEAN DEFAULT FALSE,
        completed_at TIMESTAMPTZ,
        featured BOOLEAN DEFAULT FALSE,
        user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
        "order" INTEGER
    );

    -- Enable RLS
    ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

    -- Create policies
    DO $$ 
    BEGIN
        IF NOT EXISTS (
            SELECT FROM pg_policies WHERE tablename = 'tasks' AND policyname = 'Users can view own tasks'
        ) THEN
            CREATE POLICY "Users can view own tasks"
                ON tasks FOR SELECT
                USING (auth.uid() = user_id);
        END IF;

        IF NOT EXISTS (
            SELECT FROM pg_policies WHERE tablename = 'tasks' AND policyname = 'Users can create own tasks'
        ) THEN
            CREATE POLICY "Users can create own tasks"
                ON tasks FOR INSERT
                WITH CHECK (auth.uid() = user_id);
        END IF;

        IF NOT EXISTS (
            SELECT FROM pg_policies WHERE tablename = 'tasks' AND policyname = 'Users can update own tasks'
        ) THEN
            CREATE POLICY "Users can update own tasks"
                ON tasks FOR UPDATE
                USING (auth.uid() = user_id);
        END IF;

        IF NOT EXISTS (
            SELECT FROM pg_policies WHERE tablename = 'tasks' AND policyname = 'Users can delete own tasks'
        ) THEN
            CREATE POLICY "Users can delete own tasks"
                ON tasks FOR DELETE
                USING (auth.uid() = user_id);
        END IF;
    END $$;
END;
$$;

-- Create trigger function for new user profiles
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

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();