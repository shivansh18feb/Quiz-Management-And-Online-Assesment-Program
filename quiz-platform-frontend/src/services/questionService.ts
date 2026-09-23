import api from '@/utils/api';
import {
  ApiResponse,
  CreateQuestionRequest,
  QuestionResponse,
} from '@/types';

const normalizeQuestion = (question: any): QuestionResponse => {
  return {
    ...question,
    options: (question.options || []).map((option: any) => ({
      ...option,
      isCorrect:
        option.isCorrect ?? option.correct ?? false,
    })),
  };
};

const questionService = {
  getQuestions: async (quizId: number) => {
    const response = await api.get<ApiResponse<QuestionResponse[]>>(
      `/quizzes/${quizId}/questions`
    );

    return {
      ...response.data,
      data: response.data.data.map(normalizeQuestion),
    };
  },

  addQuestion: async (
    quizId: number,
    request: CreateQuestionRequest
  ) => {
    const backendRequest = {
      ...request,
      options: request.options.map((option) => ({
        optionText: option.optionText,
        correct: option.isCorrect,
      })),
    };

    const response = await api.post<ApiResponse<QuestionResponse>>(
      `/quizzes/${quizId}/questions`,
      backendRequest
    );

    return {
      ...response.data,
      data: normalizeQuestion(response.data.data),
    };
  },

  updateQuestion: async (
    questionId: number,
    request: CreateQuestionRequest
  ) => {
    const backendRequest = {
      ...request,
      options: request.options.map((option) => ({
        optionText: option.optionText,
        correct: option.isCorrect,
      })),
    };

    const response = await api.put<ApiResponse<QuestionResponse>>(
      `/questions/${questionId}`,
      backendRequest
    );

    return {
      ...response.data,
      data: normalizeQuestion(response.data.data),
    };
  },

  deleteQuestion: async (questionId: number) => {
    const response = await api.delete<ApiResponse<void>>(
      `/questions/${questionId}`
    );

    return response.data;
  },
};

export default questionService;