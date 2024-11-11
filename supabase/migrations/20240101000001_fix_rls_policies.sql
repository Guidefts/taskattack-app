-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can create own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;

-- Create new, stricter policies
CREATE POLICY "Users can view own tasks"
ON tasks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tasks"
ON tasks FOR INSERT
WITH CHECK (
  auth.uid() = user_id
);

CREATE POLICY "Users can update own tasks"
ON tasks FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
ON tasks FOR DELETE
USING (auth.uid() = user_id);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_featured ON tasks(user_id, featured);
CREATE INDEX IF NOT EXISTS idx_tasks_user_date ON tasks(user_id, date);

-- Add constraints
ALTER TABLE tasks 
  DROP CONSTRAINT IF EXISTS tasks_user_id_fkey,
  ADD CONSTRAINT tasks_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;

-- Ensure user_id is required
ALTER TABLE tasks 
  ALTER COLUMN user_id SET NOT NULL;