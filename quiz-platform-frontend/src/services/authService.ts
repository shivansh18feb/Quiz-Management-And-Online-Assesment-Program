import api from '@/utils/api';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  ApiResponse, 
  ChangePasswordRequest 
} from '@/types';

export const authService = {
  login: async (data: LoginRequest) => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest) => {
    const response = await api.post<ApiResponse<void>>('/auth/register', data);
    return response.data;
  },

  logout: async (refreshToken: string) => {
    const response = await api.post<ApiResponse<void>>('/auth/logout', { refreshToken });
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await api.post<ApiResponse<{ accessToken: string }>>('/auth/refresh', { refreshToken });
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post<ApiResponse<void>>('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string) => {
    const response = await api.post<ApiResponse<void>>('/auth/reset-password', { token, password });
    return response.data;
  },

  changePassword: async (data: ChangePasswordRequest) => {
    const response = await api.post<ApiResponse<void>>('/auth/change-password', data);
    return response.data;
  }
};
