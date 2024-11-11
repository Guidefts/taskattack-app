import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';
import { useTaskStore } from './taskStore';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (displayName: string) => Promise<void>;
  updateUserPassword: (newPassword: string) => Promise<void>;
  clearError: () => void;
}

const handleError = (error: any): string => {
  if (!error) return 'An unexpected error occurred';

  if (error.code === 'email_address_not_authorized') {
    return 'This email address is not authorized to register';
  }

  if (error.code === 'invalid_credentials') {
    return 'Invalid email or password';
  }

  if (error.code === 'user_not_found') {
    return 'User not found';
  }

  return error.message || 'An unexpected error occurred';
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: false,
      error: null,

      clearError: () => set({ error: null }),

      signUp: async (email, password, name) => {
        try {
          set({ loading: true, error: null });
          const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { name }
            }
          });

          if (signUpError) throw signUpError;

          if (data.user) {
            set({ user: data.user, error: null });
            await useTaskStore.getState().initialize();
          }
        } catch (error) {
          const errorMessage = handleError(error);
          set({ error: errorMessage });
          throw new Error(errorMessage);
        } finally {
          set({ loading: false });
        }
      },

      signIn: async (email, password) => {
        try {
          set({ loading: true, error: null });
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          });

          if (error) throw error;
          set({ user: data.user, error: null });
          await useTaskStore.getState().initialize();
        } catch (error) {
          const errorMessage = handleError(error);
          set({ error: errorMessage });
          throw new Error(errorMessage);
        } finally {
          set({ loading: false });
        }
      },

      signOut: async () => {
        try {
          set({ loading: true, error: null });
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
          useTaskStore.getState().resetTasks();
          set({ user: null, error: null });
        } catch (error) {
          const errorMessage = handleError(error);
          set({ error: errorMessage });
          throw new Error(errorMessage);
        } finally {
          set({ loading: false });
        }
      },

      updateUserProfile: async (displayName) => {
        try {
          set({ loading: true, error: null });
          const { data: { user }, error: updateError } = await supabase.auth.updateUser({
            data: { name: displayName }
          });

          if (updateError) throw updateError;

          if (user) {
            const { error: profileError } = await supabase
              .from('profiles')
              .update({ name: displayName })
              .eq('id', user.id);

            if (profileError) throw profileError;
            set({ user, error: null });
          }
        } catch (error) {
          const errorMessage = handleError(error);
          set({ error: errorMessage });
          throw new Error(errorMessage);
        } finally {
          set({ loading: false });
        }
      },

      updateUserPassword: async (newPassword) => {
        try {
          set({ loading: true, error: null });
          const { error } = await supabase.auth.updateUser({
            password: newPassword
          });

          if (error) throw error;
          set({ error: null });
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
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);