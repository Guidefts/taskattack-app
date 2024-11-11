import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Header } from '../components/Header';
import { User, Lock, LogOut } from 'lucide-react';

export function Profile() {
  const { user, updateUserProfile, updateUserPassword, signOut, loading, error } = useAuthStore();
  const [displayName, setDisplayName] = useState(user?.user_metadata?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserProfile(displayName);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword === confirmPassword) {
      await updateUserPassword(newPassword);
      setShowPasswordForm(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-background text-white pb-24">
      <div className="content-wrapper">
        <Header />
        <h2 className="text-4xl font-bold mb-8 text-[#666666]">Profile</h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div className="bg-surface p-6 rounded-xl">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <User size={24} />
              User Details
            </h3>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full p-3 rounded-lg bg-surface-light"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full p-3 rounded-lg bg-surface-light opacity-50"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-[#EF442D] text-[#232223] px-6 py-2 rounded-lg"
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>

          <div className="bg-surface p-6 rounded-xl">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Lock size={24} />
              Security
            </h3>

            {showPasswordForm ? (
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full p-3 rounded-lg bg-surface-light"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-3 rounded-lg bg-surface-light"
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-3 rounded-lg bg-surface-light"
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading || newPassword !== confirmPassword}
                    className="bg-[#EF442D] text-[#232223] px-6 py-2 rounded-lg"
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPasswordForm(false)}
                    className="bg-surface-light hover:bg-opacity-90 text-white px-6 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="bg-surface-light hover:bg-opacity-90 text-white px-6 py-2 rounded-lg"
              >
                Change Password
              </button>
            )}
          </div>

          <div className="bg-surface p-6 rounded-xl">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <LogOut size={24} />
              Account
            </h3>

            <button
              onClick={signOut}
              className="bg-[#EF442D] text-[#232223] px-6 py-2 rounded-lg"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}