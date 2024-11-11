import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogIn, AlertCircle } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();
  const { signIn, error, clearError } = useAuthStore();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const message = location.state?.message;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      clearError();
      await signIn(email, password);
      navigate('/');
    } catch (err: any) {
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-[48px] sm:text-[64px] font-medium leading-[0.9] tracking-tight">
            Task<br />Attack
          </h1>
          <p className="text-gray-400 mt-4">Sign in to continue</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="bg-green-500/10 border border-green-500 text-green-500 p-4 rounded-lg mb-6">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearError();
              }}
              className={`w-full p-3 rounded-lg bg-surface border ${
                error ? 'border-red-500' : 'border-transparent'
              }`}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearError();
              }}
              className={`w-full p-3 rounded-lg bg-surface border ${
                error ? 'border-red-500' : 'border-transparent'
              }`}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#EF442D] text-[#232223] py-3 rounded-lg font-medium flex items-center justify-center gap-2"
          >
            {loading ? (
              'Signing in...'
            ) : (
              <>
                <LogIn size={20} />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center space-y-4">
          <p className="text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#EF442D] hover:underline">
              Sign up
            </Link>
          </p>
          <Link to="/forgot-password" className="text-[#EF442D] hover:underline text-sm">
            Forgot your password?
          </Link>
        </div>
      </div>
    </div>
  );
}