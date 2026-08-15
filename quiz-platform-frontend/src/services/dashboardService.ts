import api from '@/utils/api';
import { ApiResponse, StudentDashboardStats, AdminDashboardStats } from '@/types';

export const dashboardService = {
  getStudentDashboard: async () => {
    const response = await api.get<ApiResponse<StudentDashboardStats>>('/dashboard/student');
    return response.data;
  },

  getAdminDashboard: async () => {
    const response = await api.get<ApiResponse<AdminDashboardStats>>('/dashboard/admin');
    return response.data;
  }
};

export default dashboardService;
