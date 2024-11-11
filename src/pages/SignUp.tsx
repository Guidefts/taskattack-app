import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { UserPlus } from 'lucide-react';

export function SignUp() {
  const navigate = useNavigate();
  const { signUp, error, loading, clearError } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return;
    }
    try {
      await signUp(email, password, name);
      navigate('/');
    } catch (error) {
      // Error is handled by the store
    }
  };

  return (
    <div className="min-h-screen bg-background text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Task Attack</h1>
          <p className="text-gray-400">Create your account</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                clearError();
              }}
              className="w-full p-3 rounded-lg bg-surface"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearError();
              }}
              className="w-full p-3 rounded-lg bg-surface"
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
              className="w-full p-3 rounded-lg bg-surface"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                clearError();
              }}
              className="w-full p-3 rounded-lg bg-surface"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || password !== confirmPassword}
            className="w-full bg-primary hover:bg-opacity-90 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2"
          >
            {loading ? (
              'Creating account...'
            ) : (
              <>
                <UserPlus size={20} />
                Create Account
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}