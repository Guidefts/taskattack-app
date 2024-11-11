import React, { createContext, useContext, useEffect, useState } from 'react';
import { Task } from '../types/Task';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../config/supabase';

interface TaskContextType {
  homeTasks: Task[];
  allTasks: Task[];
  loading: boolean;
  error: string | null;
}

const TaskContext = createContext<TaskContextType | null>(null);

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthStore();
  const [homeTasks, setHomeTasks] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setHomeTasks([]);
      setAllTasks([]);
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);
    setError(null);

    // Function to fetch tasks
    const fetchTasks = async () => {
      try {
        const [{ data: homeTasks, error: homeError }, { data: allTasks, error: allError }] = await Promise.all([
          supabase
            .from('tasks')
            .select('*')
            .eq('user_id', user.id)
            .eq('featured', true)
            .order('order', { ascending: true }),
          supabase
            .from('tasks')
            .select('*')
            .eq('user_id', user.id)
            .eq('featured', false)
            .order('created_at', { ascending: false })
        ]);

        if (homeError) throw homeError;
        if (allError) throw allError;

        if (mounted) {
          setHomeTasks(homeTasks || []);
          setAllTasks(allTasks || []);
          setError(null);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Initial fetch
    fetchTasks();

    // Set up real-time subscription
    const subscription = supabase
      .channel('tasks_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'tasks',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          fetchTasks(); // Refetch all tasks to ensure consistency
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [user]);

  const value = {
    homeTasks,
    allTasks,
    loading,
    error,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};