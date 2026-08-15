package com.quizplatform.service;

import com.quizplatform.dto.request.SaveAnswerRequest;
import com.quizplatform.dto.request.SubmitAttemptRequest;
import com.quizplatform.dto.response.*;
import com.quizplatform.util.PagedResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface QuizAttemptService {
    StartAttemptResponse startQuiz(Long quizId, String userEmail);
    void saveAnswer(Long attemptId, SaveAnswerRequest answerRequest, String userEmail);
    QuizResultResponse submitQuiz(Long attemptId, SubmitAttemptRequest submitRequest, String userEmail);
    QuizResultResponse getResult(Long attemptId, String userEmail);
    AttemptReviewResponse getAttemptReview(Long attemptId, String userEmail);
    PagedResponse<QuizResultResponse> getUserAttempts(String userEmail, Pageable pageable);
    PagedResponse<QuizResultResponse> getAllAttemptsAdmin(Pageable pageable);
    PagedResponse<LeaderboardEntry> getGlobalLeaderboard(Pageable pageable);
    PagedResponse<LeaderboardEntry> getQuizLeaderboard(Long quizId, Pageable pageable);
    StudentDashboardStats getStudentDashboardStats(String userEmail);
    AdminDashboardStats getAdminDashboardStats();
}
