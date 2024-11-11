import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/login" className="inline-flex items-center text-gray-400 hover:text-white mb-8">
          <ArrowLeft size={20} className="mr-2" />
          Back to Login
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-[48px] sm:text-[64px] font-medium leading-[0.9] tracking-tight">
            Reset<br />Password
          </h1>
          <p className="text-gray-400 mt-4">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="bg-green-500/10 border border-green-500 text-green-500 p-4 rounded-lg mb-6">
            Check your email for password reset instructions.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-lg bg-surface"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#EF442D] text-[#232223] py-3 rounded-lg font-medium"
            >
              {loading ? 'Sending...' : 'Send Reset Instructions'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}