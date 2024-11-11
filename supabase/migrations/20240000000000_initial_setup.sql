-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    title TEXT NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    featured BOOLEAN DEFAULT FALSE,
    "group" TEXT,
    date DATE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    "order" INTEGER
);

-- Create stored procedure for table creation
CREATE OR REPLACE FUNCTION create_tables()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Create profiles table if it doesn't exist
    CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        avatar_url TEXT
    );

    -- Create tasks table if it doesn't exist
    CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
        title TEXT NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT FALSE,
        completed_at TIMESTAMP WITH TIME ZONE,
        featured BOOLEAN DEFAULT FALSE,
        "group" TEXT,
        date DATE NOT NULL,
        user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
        "order" INTEGER
    );
END;
$$;