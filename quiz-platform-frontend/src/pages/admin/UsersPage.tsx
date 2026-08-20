import React, { useEffect, useState } from 'react';
import { Users, Search, Shield, Lock, Unlock, UserCheck, UserX, RefreshCw, Trash2 } from 'lucide-react';
import { userService } from '@/services/userService';
import { UserResponse, PagedResponse } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Pagination from '@/components/common/Pagination';
import ConfirmModal from '@/components/common/ConfirmModal';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export const UsersPage: React.FC = () => {
  const [usersData, setUsersData] = useState<PagedResponse<UserResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [page, setPage] = useState(0);

  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    loadUsers(page, search, roleFilter);
  }, [page, roleFilter]);

  const loadUsers = async (pageNo: number, searchQuery: string, role: string) => {
    try {
      setLoading(true);
      const res = await userService.getAllUsers(
        searchQuery || undefined,
        (role as any) || undefined,
        pageNo,
        10
      );
      setUsersData((res as any)?.data || res);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    loadUsers(0, search, roleFilter);
  };

  const handleToggleStatus = async (user: UserResponse) => {
    try {
      const res = await userService.updateUserStatus(user.id, {
        enabled: !user.enabled,
      });
      const updated: UserResponse = (res as any)?.data || res;
      toast.success(`User ${updated.enabled ? 'activated' : 'deactivated'} successfully`);
      loadUsers(page, search, roleFilter);
    } catch (err) {
      toast.error('Failed to update user status');
    }
  };

  const handleToggleLock = async (user: UserResponse) => {
    try {
      const res = await userService.updateUserStatus(user.id, {
        accountLocked: !user.accountLocked,
      });
      const updated: UserResponse = (res as any)?.data || res;
      toast.success(`Account ${updated.accountLocked ? 'locked' : 'unlocked'} successfully`);
      loadUsers(page, search, roleFilter);
    } catch (err) {
      toast.error('Failed to update account lock status');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      await userService.deleteUser(selectedUser.id);
      toast.success('User deleted successfully');
      setDeleteModalOpen(false);
      loadUsers(page, search, roleFilter);
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-primary-400" />
            User Management
          </h1>
          <p className="page-subtitle">View, filter, lock, unlock, and manage platform user accounts.</p>
        </div>
        <button onClick={() => loadUsers(page, search, roleFilter)} className="btn-secondary text-sm flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Filter & Search Controls */}
      <div className="glass-card p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10 text-sm"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input-field py-2 text-sm w-full md:w-48"
          >
            <option value="" className="bg-dark-800">All Roles</option>
            <option value="ROLE_STUDENT" className="bg-dark-800">Students</option>
            <option value="ROLE_ADMIN" className="bg-dark-800">Admins</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <LoadingSpinner message="Loading user directory..." />
      ) : !usersData || usersData.content.length === 0 ? (
        <div className="glass-card p-8 text-center text-gray-400">
          No users found matching your search or filters.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Account Status</th>
                  <th>Registered</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersData.content.map((u) => (
                  <tr key={u.id}>
                    <td className="font-semibold text-white">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="text-gray-300 text-sm">{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === 'ROLE_ADMIN' ? 'badge-primary' : 'badge-info'}`}>
                        {u.role === 'ROLE_ADMIN' ? 'Admin' : 'Student'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        {u.enabled ? (
                          <span className="badge badge-success">Active</span>
                        ) : (
                          <span className="badge badge-danger">Disabled</span>
                        )}
                        {u.accountLocked && (
                          <span className="badge badge-warning flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Locked
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="text-gray-400 text-xs">
                      {u.createdAt ? format(new Date(u.createdAt), 'MMM dd, yyyy') : 'N/A'}
                    </td>
                    <td className="text-right space-x-2">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        title={u.enabled ? 'Deactivate User' : 'Activate User'}
                        className={`p-2 rounded-lg border text-xs transition-all ${
                          u.enabled
                            ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                            : 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'
                        }`}
                      >
                        {u.enabled ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => handleToggleLock(u)}
                        title={u.accountLocked ? 'Unlock Account' : 'Lock Account'}
                        className="p-2 rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/20 text-xs transition-all"
                      >
                        {u.accountLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => { setSelectedUser(u); setDeleteModalOpen(true); }}
                        title="Delete User"
                        className="p-2 rounded-lg bg-red-600/10 text-red-400 border border-red-500/20 hover:bg-red-600/20 text-xs transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={usersData.page}
            totalPages={usersData.totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete User Account"
        message={`Are you sure you want to permanently delete the user account for ${selectedUser?.firstName} ${selectedUser?.lastName} (${selectedUser?.email})? This action cannot be undone.`}
        confirmText="Delete User"
        onConfirm={handleDeleteUser}
        onClose={() => setDeleteModalOpen(false)}
      />
    </div>
  );
};

export default UsersPage;
