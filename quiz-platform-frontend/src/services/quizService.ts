import api from '@/utils/api';
import { 
  QuizResponse, 
  CreateQuizRequest, 
  QuestionResponse, 
  CreateQuestionRequest, 
  PagedResponse, 
  ApiResponse,
  QuizStatus
} from '@/types';

export const quizService = {
  getQuizzes: async (page = 0, size = 10, categoryId?: number, status?: QuizStatus) => {
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
    if (categoryId) params.append('categoryId', categoryId.toString());
    if (status) params.append('status', status);
    
    const response = await api.get<ApiResponse<PagedResponse<QuizResponse>>>(`/quizzes?${params.toString()}`);
    return response.data;
  },

  getQuizById: async (id: number) => {
    const response = await api.get<ApiResponse<QuizResponse>>(`/quizzes/${id}`);
    return response.data;
  },

  createQuiz: async (data: CreateQuizRequest) => {
    const response = await api.post<ApiResponse<QuizResponse>>('/quizzes', data);
    return response.data;
  },

  updateQuiz: async (id: number, data: CreateQuizRequest) => {
    const response = await api.put<ApiResponse<QuizResponse>>(`/quizzes/${id}`, data);
    return response.data;
  },

  deleteQuiz: async (id: number) => {
    const response = await api.delete<ApiResponse<void>>(`/quizzes/${id}`);
    return response.data;
  },

  changeQuizStatus: async (id: number, status: QuizStatus) => {
    const response = await api.put<ApiResponse<QuizResponse>>(`/quizzes/${id}/status`, { status });
    return response.data;
  },

  // Questions
  getQuestionsByQuizId: async (quizId: number) => {
    const response = await api.get<ApiResponse<QuestionResponse[]>>(`/quizzes/${quizId}/questions`);
    return response.data;
  },

  addQuestion: async (quizId: number, data: CreateQuestionRequest) => {
    const response = await api.post<ApiResponse<QuestionResponse>>(`/quizzes/${quizId}/questions`, data);
    return response.data;
  },

  updateQuestion: async (quizId: number, questionId: number, data: CreateQuestionRequest) => {
    const response = await api.put<ApiResponse<QuestionResponse>>(`/quizzes/${quizId}/questions/${questionId}`, data);
    return response.data;
  },

  deleteQuestion: async (quizId: number, questionId: number) => {
    const response = await api.delete<ApiResponse<void>>(`/quizzes/${quizId}/questions/${questionId}`);
    return response.data;
  }
};
