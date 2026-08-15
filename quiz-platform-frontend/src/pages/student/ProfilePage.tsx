import React, { useState } from 'react';
import { User, Lock, Save, KeyRound, Shield, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import authService from '@/services/authService';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/utils/api';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();

  // Profile info state
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      toast.error('First and last name are required');
      return;
    }
    try {
      setUpdatingProfile(true);
      const updatedUser = await authService.updateProfile({ firstName, lastName });
      updateUser(updatedUser);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      setChangingPassword(true);
      await authService.changePassword({ currentPassword, newPassword, confirmPassword });
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <User className="w-6 h-6 text-primary-400" />
          Account Profile & Settings
        </h1>
        <p className="page-subtitle">Manage your personal account information and security credentials.</p>
      </div>

      {/* User Card */}
      <div className="glass-card p-6 flex items-center gap-4 border-l-4 border-l-primary-500">
        <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-2xl shadow-lg">
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">{user?.firstName} {user?.lastName}</h2>
          <p className="text-gray-400 text-sm">{user?.email}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="badge badge-primary">{user?.role === 'ROLE_ADMIN' ? 'Administrator' : 'Student'}</span>
            <span className="badge badge-success flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Account Active
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details Form */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-3">
            <User className="w-5 h-5 text-primary-400" />
            <h3 className="text-lg font-bold text-white">Personal Information</h3>
          </div>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="label">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label">Email Address (Read Only)</label>
              <input
                type="email"
                value={user?.email || ''}
                className="input-field bg-white/5 opacity-60 cursor-not-allowed"
                disabled
              />
            </div>
            <button type="submit" disabled={updatingProfile} className="btn-primary w-full flex items-center justify-center gap-2 mt-4">
              <Save className="w-4 h-4" />
              {updatingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-3">
            <KeyRound className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-bold text-white">Security & Password</h3>
          </div>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="label">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>
            <div>
              <label className="label">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-field"
                placeholder="At least 6 characters"
                required
              />
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
                placeholder="Re-enter new password"
                required
              />
            </div>
            <button type="submit" disabled={changingPassword} className="btn-secondary w-full flex items-center justify-center gap-2 mt-4">
              <Shield className="w-4 h-4 text-yellow-400" />
              {changingPassword ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
