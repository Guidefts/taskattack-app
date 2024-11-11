import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../config/supabase';
import { Task } from '../types/Task';

interface TaskState {
  homeTasks: Task[];
  allTasks: Task[];
  groups: string[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
  initialize: () => Promise<void>;
  fetchTasks: () => Promise<void>;
  addTask: (taskData: Partial<Task>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  moveTaskToHome: (taskId: string) => Promise<void>;
  moveTaskToAll: (taskId: string) => Promise<void>;
  reorderTasks: (tasks: Task[]) => Promise<void>;
  resetTasks: () => void;
  clearError: () => void;
}

const handleError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return 'An unexpected error occurred';
};

const validateTaskData = (taskData: Partial<Task>): void => {
  if (!taskData.title?.trim()) {
    throw new Error('Task title is required');
  }
  if (!taskData.date) {
    throw new Error('Task date is required');
  }
  if (!taskData.group?.trim()) {
    throw new Error('Task group is required');
  }
};

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      homeTasks: [],
      allTasks: [],
      groups: ['Work', 'Personal'],
      loading: false,
      error: null,
      initialized: false,

      resetTasks: () => {
        set({ 
          homeTasks: [], 
          allTasks: [], 
          initialized: false,
          error: null 
        });
      },

      clearError: () => set({ error: null }),

      initialize: async () => {
        if (!get().initialized) {
          try {
            await get().fetchTasks();
            set({ initialized: true, error: null });
          } catch (error) {
            const errorMessage = handleError(error);
            set({ error: errorMessage, initialized: false });
            throw new Error(errorMessage);
          }
        }
      },

      fetchTasks: async () => {
        try {
          set({ loading: true, error: null });

          const { data: { user }, error: authError } = await supabase.auth.getUser();
          if (authError) throw authError;
          if (!user) throw new Error('Authentication required');
          
          const [{ data: homeTasks, error: homeError }, { data: allTasks, error: allError }] = await Promise.all([
            supabase
              .from('tasks')
              .select('*')
              .eq('featured', true)
              .order('created_at', { ascending: false }),
            supabase
              .from('tasks')
              .select('*')
              .eq('featured', false)
              .order('created_at', { ascending: false })
          ]);

          if (homeError) throw homeError;
          if (allError) throw allError;
          if (!homeTasks || !allTasks) throw new Error('Failed to fetch tasks');

          set({ 
            homeTasks: homeTasks as Task[], 
            allTasks: allTasks as Task[],
            error: null
          });
        } catch (error) {
          const errorMessage = handleError(error);
          set({ error: errorMessage });
          throw new Error(errorMessage);
        } finally {
          set({ loading: false });
        }
      },

      addTask: async (taskData) => {
        try {
          validateTaskData(taskData);
          set({ loading: true, error: null });

          const { data: { user }, error: authError } = await supabase.auth.getUser();
          if (authError) throw authError;
          if (!user) throw new Error('Authentication required');

          if (taskData.featured && get().homeTasks.length >= 3) {
            throw new Error('Maximum of 3 featured tasks allowed');
          }

          const { data, error } = await supabase
            .from('tasks')
            .insert([{
              title: taskData.title.trim(),
              description: taskData.description?.trim() || '',
              group: taskData.group.trim(),
              date: taskData.date,
              featured: Boolean(taskData.featured),
              completed: false,
              user_id: user.id,
              created_at: new Date().toISOString()
            }])
            .select()
            .single();

          if (error) throw error;
          if (!data) throw new Error('Failed to create task');

          const newTask = data as Task;

          set(state => ({
            homeTasks: newTask.featured ? [...state.homeTasks, newTask] : state.homeTasks,
            allTasks: !newTask.featured ? [...state.allTasks, newTask] : state.allTasks,
            error: null
          }));

          return newTask;
        } catch (error) {
          const errorMessage = handleError(error);
          set({ error: errorMessage });
          throw new Error(errorMessage);
        } finally {
          set({ loading: false });
        }
      },

      updateTask: async (id, updates) => {
        try {
          set({ loading: true, error: null });

          const { data: { user }, error: authError } = await supabase.auth.getUser();
          if (authError) throw authError;
          if (!user) throw new Error('Authentication required');

          const { data, error } = await supabase
            .from('tasks')
            .update({
              ...updates,
              completed_at: updates.completed ? new Date().toISOString() : null
            })
            .eq('id', id)
            .select()
            .single();

          if (error) throw error;
          if (!data) throw new Error('Failed to update task');

          const updatedTask = data as Task;

          set(state => ({
            homeTasks: state.homeTasks.map(t => t.id === id ? updatedTask : t),
            allTasks: state.allTasks.map(t => t.id === id ? updatedTask : t),
            error: null
          }));

          return updatedTask;
        } catch (error) {
          const errorMessage = handleError(error);
          set({ error: errorMessage });
          throw new Error(errorMessage);
        } finally {
          set({ loading: false });
        }
      },

      deleteTask: async (id) => {
        try {
          set({ loading: true, error: null });

          const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', id);

          if (error) throw error;

          set(state => ({
            homeTasks: state.homeTasks.filter(t => t.id !== id),
            allTasks: state.allTasks.filter(t => t.id !== id),
            error: null
          }));
        } catch (error) {
          const errorMessage = handleError(error);
          set({ error: errorMessage });
          throw new Error(errorMessage);
        } finally {
          set({ loading: false });
        }
      },

      moveTaskToHome: async (taskId) => {
        try {
          set({ loading: true, error: null });

          if (get().homeTasks.length >= 3) {
            throw new Error('Maximum of 3 featured tasks allowed');
          }

          await get().updateTask(taskId, { featured: true });
          await get().fetchTasks();
        } catch (error) {
          const errorMessage = handleError(error);
          set({ error: errorMessage });
          throw new Error(errorMessage);
        } finally {
          set({ loading: false });
        }
      },

      moveTaskToAll: async (taskId) => {
        try {
          set({ loading: true, error: null });
          await get().updateTask(taskId, { featured: false });
          await get().fetchTasks();
        } catch (error) {
          const errorMessage = handleError(error);
          set({ error: errorMessage });
          throw new Error(errorMessage);
        } finally {
          set({ loading: false });
        }
      },

      reorderTasks: async (tasks) => {
        try {
          set({ loading: true, error: null });

          const updates = tasks.map((task, index) => 
            supabase
              .from('tasks')
              .update({ order: index })
              .eq('id', task.id)
          );

          await Promise.all(updates);

          const isFeatured = tasks[0]?.featured;
          set(state => ({
            homeTasks: isFeatured ? tasks : state.homeTasks,
            allTasks: !isFeatured ? tasks : state.allTasks,
            error: null
          }));
        } catch (error) {
          const errorMessage = handleError(error);
          set({ error: errorMessage });
          throw new Error(errorMessage);
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: 'task-storage',
      version: 1,
      partialize: (state) => ({
        groups: state.groups
      })
    }
  )
);