import api from '@/utils/api';
import { 
  UserResponse, 
  UpdateProfileRequest, 
  PagedResponse, 
  ApiResponse,
  AdminDashboardStats,
  StudentDashboardStats
} from '@/types';

export const userService = {
  getCurrentUser: async () => {
    const response = await api.get<ApiResponse<UserResponse>>('/users/me');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileRequest) => {
    const response = await api.put<ApiResponse<UserResponse>>('/users/me', data);
    return response.data;
  },

  getUsers: async (page = 0, size = 10, role?: string) => {
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
    if (role) params.append('role', role);
    
    const response = await api.get<ApiResponse<PagedResponse<UserResponse>>>(`/users?${params.toString()}`);
    return response.data;
  },

  getUserById: async (id: number) => {
    const response = await api.get<ApiResponse<UserResponse>>(`/users/${id}`);
    return response.data;
  },

  toggleUserStatus: async (id: number) => {
    const response = await api.put<ApiResponse<UserResponse>>(`/users/${id}/toggle-status`);
    return response.data;
  },

  getAdminDashboardStats: async () => {
    const response = await api.get<ApiResponse<AdminDashboardStats>>('/users/admin/dashboard');
    return response.data;
  },

  getStudentDashboardStats: async () => {
    const response = await api.get<ApiResponse<StudentDashboardStats>>('/users/student/dashboard');
    return response.data;
  }
};
