import api from '@/utils/api';
import {
  ApiResponse,
  CreateQuestionRequest,
  QuestionResponse,
} from '@/types';

const questionService = {
  getQuestions: async (quizId: number) => {
    const response = await api.get<ApiResponse<QuestionResponse[]>>(
      `/quizzes/${quizId}/questions`
    );

    return response.data;
  },

  addQuestion: async (
    quizId: number,
    request: CreateQuestionRequest
  ) => {
    const response = await api.post<ApiResponse<QuestionResponse>>(
      `/quizzes/${quizId}/questions`,
      request
    );

    return response.data;
  },

  updateQuestion: async (
    questionId: number,
    request: CreateQuestionRequest
  ) => {
    const response = await api.put<ApiResponse<QuestionResponse>>(
      `/questions/${questionId}`,
      request
    );

    return response.data;
  },

  deleteQuestion: async (questionId: number) => {
    const response = await api.delete<ApiResponse<void>>(
      `/questions/${questionId}`
    );

    return response.data;
  },
};

export default questionService;