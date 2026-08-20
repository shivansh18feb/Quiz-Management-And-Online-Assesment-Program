import api from '@/utils/api';
import { 
  StartAttemptResponse, 
  SubmitAttemptRequest, 
  QuizResultResponse, 
  AttemptReviewResponse,
  PagedResponse,
  ApiResponse 
} from '@/types';

export const attemptService = {
  startAttempt: async (quizId: number) => {
    const response = await api.post<ApiResponse<StartAttemptResponse>>(`/quizzes/${quizId}/attempts/start`);
    return response.data;
  },

  saveAnswer: async (attemptId: number, data: { questionId: number; selectedOptionId: number | null }) => {
    const response = await api.post<ApiResponse<void>>(`/attempts/${attemptId}/answers`, data);
    return response.data;
  },

  submitAttempt: async (attemptId: number, data?: SubmitAttemptRequest) => {
    const response = await api.post<ApiResponse<QuizResultResponse>>(`/attempts/${attemptId}/submit`, data || {});
    return response.data;
  },

  getResult: async (attemptId: number) => {
    const response = await api.get<ApiResponse<QuizResultResponse>>(`/attempts/${attemptId}/result`);
    return response.data;
  },

  getReview: async (attemptId: number) => {
    const response = await api.get<ApiResponse<AttemptReviewResponse>>(`/attempts/${attemptId}/review`);
    return response.data;
  },

  getUserAttempts: async (page = 0, size = 10) => {
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
    const response = await api.get<ApiResponse<PagedResponse<QuizResultResponse>>>(`/users/me/attempts?${params.toString()}`);
    return response.data;
  },

  getMyAttempts: async (page = 0, size = 10) => {
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
    const response = await api.get<ApiResponse<PagedResponse<QuizResultResponse>>>(`/users/me/attempts?${params.toString()}`);
    return response.data;
  },

  getAllAttempts: async (page = 0, size = 10) => {
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
    const response = await api.get<ApiResponse<PagedResponse<QuizResultResponse>>>(`/admin/attempts?${params.toString()}`);
    return response.data;
  },

  getAllAttemptsAdmin: async (page = 0, size = 10) => {
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
    const response = await api.get<ApiResponse<PagedResponse<QuizResultResponse>>>(`/admin/attempts?${params.toString()}`);
    return response.data;
  }
};

export default attemptService;
