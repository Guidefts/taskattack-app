import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase configuration. Please check your environment variables.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'task-attack-auth',
    storage: localStorage
  }
});

export async function initializeDatabase() {
  try {
    // Verify connection and authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.warn('Authentication check failed:', authError.message);
    }

    // Verify profiles table exists and is accessible
    const { error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (profilesError && profilesError.code === '42P01') {
      throw new Error('Profiles table not found. Please run the database migrations.');
    }

    // Verify tasks table exists and is accessible
    const { error: tasksError } = await supabase
      .from('tasks')
      .select('id')
      .limit(1);

    if (tasksError && tasksError.code === '42P01') {
      throw new Error('Tasks table not found. Please run the database migrations.');
    }

    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}