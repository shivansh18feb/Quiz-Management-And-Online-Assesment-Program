import api from '@/utils/api';
import { 
  CategoryResponse, 
  CreateCategoryRequest, 
  ApiResponse 
} from '@/types';

export const categoryService = {
  getAllCategories: async () => {
    const response = await api.get<ApiResponse<CategoryResponse[]>>('/categories');
    return response.data;
  },

  getCategoryById: async (id: number) => {
    const response = await api.get<ApiResponse<CategoryResponse>>(`/categories/${id}`);
    return response.data;
  },

  createCategory: async (data: CreateCategoryRequest) => {
    const response = await api.post<ApiResponse<CategoryResponse>>('/categories', data);
    return response.data;
  },

  updateCategory: async (id: number, data: CreateCategoryRequest) => {
    const response = await api.put<ApiResponse<CategoryResponse>>(`/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: number) => {
    const response = await api.delete<ApiResponse<void>>(`/categories/${id}`);
    return response.data;
  }
};
