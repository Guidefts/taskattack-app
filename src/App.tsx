import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Home } from './pages/Home';
import { TaskListPage } from './pages/TaskListPage';
import { Progress } from './pages/Progress';
import { Analytics } from './pages/Analytics';
import { Profile } from './pages/Profile';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { Layout } from './components/Layout';
import { PrivateRoute } from './components/PrivateRoute';
import { AuthProvider } from './contexts/AuthContext';
import { TaskProvider } from './contexts/TaskContext';
import { initializeDatabase } from './config/supabase';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<Layout />}>
        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/tasks" element={<PrivateRoute><TaskListPage /></PrivateRoute>} />
        <Route path="/progress" element={<PrivateRoute><Progress /></PrivateRoute>} />
        <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        await initializeDatabase();
        setIsInitialized(true);
      } catch (err) {
        setError('Failed to initialize database. Please try again later.');
        console.error('Initialization error:', err);
      }
    };

    init();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-6 rounded-lg max-w-md text-center">
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#EF442D]"></div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <TaskProvider>
        <AppRoutes />
      </TaskProvider>
    </AuthProvider>
  );
}