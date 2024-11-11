-- Add NOT NULL constraints to required fields
ALTER TABLE tasks
  ALTER COLUMN title SET NOT NULL,
  ALTER COLUMN date SET NOT NULL,
  ALTER COLUMN user_id SET NOT NULL;

-- Add default values for optional fields
ALTER TABLE tasks
  ALTER COLUMN completed SET DEFAULT false,
  ALTER COLUMN featured SET DEFAULT false,
  ALTER COLUMN "group" SET DEFAULT 'Uncategorized';

-- Create or replace the task creation function
CREATE OR REPLACE FUNCTION create_task()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Ensure user_id is set
  IF NEW.user_id IS NULL THEN
    RAISE EXCEPTION 'user_id is required';
  END IF;

  -- Set default values if not provided
  NEW.created_at := COALESCE(NEW.created_at, now());
  NEW.completed := COALESCE(NEW.completed, false);
  NEW.featured := COALESCE(NEW.featured, false);
  NEW."group" := COALESCE(NEW."group", 'Uncategorized');

  RETURN NEW;
END;
$$;

-- Create trigger for task creation
DROP TRIGGER IF EXISTS before_task_insert ON tasks;
CREATE TRIGGER before_task_insert
  BEFORE INSERT ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION create_task();

-- Recreate RLS policies with proper checks
DROP POLICY IF EXISTS "Users can create own tasks" ON tasks;
CREATE POLICY "Users can create own tasks"
  ON tasks FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    title IS NOT NULL AND
    date IS NOT NULL
  );