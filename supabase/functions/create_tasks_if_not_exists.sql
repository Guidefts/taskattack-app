CREATE OR REPLACE FUNCTION create_tasks_if_not_exists()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create tasks table if it doesn't exist
  CREATE TABLE IF NOT EXISTS tasks (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users on delete cascade not null,
    title text not null,
    description text,
    group_name text default 'Uncategorized',
    date date not null default current_date,
    completed boolean default false,
    completed_at timestamptz,
    featured boolean default false,
    created_at timestamptz default now(),
    "order" integer
  );

  -- Enable Row Level Security (RLS) on tasks
  ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

  -- Create policies if they don't exist
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
      SELECT FROM pg_policies WHERE