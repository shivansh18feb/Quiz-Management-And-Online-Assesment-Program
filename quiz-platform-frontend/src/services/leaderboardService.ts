import api from '@/utils/api';
import { 
  LeaderboardEntry, 
  PagedResponse, 
  ApiResponse 
} from '@/types';

export const leaderboardService = {
  getGlobalLeaderboard: async (page = 0, size = 10) => {
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
    const response = await api.get<ApiResponse<PagedResponse<LeaderboardEntry>>>(`/leaderboard/global?${params.toString()}`);
    return response.data;
  },

  getQuizLeaderboard: async (quizId: number, page = 0, size = 10) => {
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
    const response = await api.get<ApiResponse<PagedResponse<LeaderboardEntry>>>(`/leaderboard/quiz/${quizId}?${params.toString()}`);
    return response.data;
  }
};
