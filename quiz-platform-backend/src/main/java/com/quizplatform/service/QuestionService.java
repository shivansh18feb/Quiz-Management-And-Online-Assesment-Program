package com.quizplatform.service;

import com.quizplatform.dto.request.CreateQuestionRequest;
import com.quizplatform.dto.request.UpdateQuestionRequest;
import com.quizplatform.dto.response.QuestionResponse;

import java.util.List;

public interface QuestionService {
    QuestionResponse addQuestion(Long quizId, CreateQuestionRequest request);
    QuestionResponse updateQuestion(Long questionId, UpdateQuestionRequest request);
    void deleteQuestion(Long questionId);
    List<QuestionResponse> getQuestionsByQuizId(Long quizId, boolean includeAnswers);
    QuestionResponse getQuestionById(Long questionId, boolean includeAnswers);
    long countByQuizId(Long quizId);
}
