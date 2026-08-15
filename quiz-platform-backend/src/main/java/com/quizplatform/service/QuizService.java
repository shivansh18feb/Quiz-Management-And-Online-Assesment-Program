package com.quizplatform.service;

import com.quizplatform.dto.request.CreateQuizRequest;
import com.quizplatform.dto.request.UpdateQuizRequest;
import com.quizplatform.dto.response.QuizResponse;
import com.quizplatform.dto.response.QuizSummaryResponse;
import com.quizplatform.enums.Difficulty;
import com.quizplatform.enums.QuizStatus;
import com.quizplatform.util.PagedResponse;
import org.springframework.data.domain.Pageable;

public interface QuizService {
    QuizResponse createQuiz(CreateQuizRequest request, String creatorEmail);
    QuizResponse updateQuiz(Long id, UpdateQuizRequest request);
    void deleteQuiz(Long id);
    QuizResponse getQuizById(Long id);
    PagedResponse<QuizSummaryResponse> getAllQuizzes(String search, QuizStatus status, Long categoryId, Difficulty difficulty, Pageable pageable);
    PagedResponse<QuizSummaryResponse> getPublishedQuizzes(String search, Long categoryId, Difficulty difficulty, Pageable pageable);
    QuizResponse publishQuiz(Long id);
    QuizResponse unpublishQuiz(Long id);
    QuizResponse duplicateQuiz(Long id, String creatorEmail);
    long countByStatus(QuizStatus status);
    long countAll();
}
