package com.quizplatform.mapper;

import com.quizplatform.dto.response.QuizResponse;
import com.quizplatform.dto.response.QuizSummaryResponse;
import com.quizplatform.entity.Quiz;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class QuizMapper {

    private final CategoryMapper categoryMapper;
    private final UserMapper userMapper;

    public QuizResponse toQuizResponse(Quiz quiz) {
        if (quiz == null) return null;
        return QuizResponse.builder()
                .id(quiz.getId())
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .category(categoryMapper.toCategoryResponse(quiz.getCategory()))
                .difficulty(quiz.getDifficulty())
                .durationMinutes(quiz.getDurationMinutes())
                .totalMarks(quiz.getTotalMarks())
                .passingMarks(quiz.getPassingMarks())
                .status(quiz.getStatus())
                .startDate(quiz.getStartDate())
                .endDate(quiz.getEndDate())
                .questionCount(quiz.getQuestions() != null ? quiz.getQuestions().size() : 0)
                .attemptCount(quiz.getAttempts() != null ? quiz.getAttempts().size() : 0)
                .createdBy(userMapper.toUserResponse(quiz.getCreatedBy()))
                .createdAt(quiz.getCreatedAt())
                .updatedAt(quiz.getUpdatedAt())
                .build();
    }

    public QuizSummaryResponse toQuizSummaryResponse(Quiz quiz) {
        if (quiz == null) return null;
        return QuizSummaryResponse.builder()
                .id(quiz.getId())
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .categoryName(quiz.getCategory() != null ? quiz.getCategory().getName() : null)
                .categoryId(quiz.getCategory() != null ? quiz.getCategory().getId() : null)
                .difficulty(quiz.getDifficulty())
                .durationMinutes(quiz.getDurationMinutes())
                .totalMarks(quiz.getTotalMarks())
                .passingMarks(quiz.getPassingMarks())
                .status(quiz.getStatus())
                .questionCount(quiz.getQuestions() != null ? quiz.getQuestions().size() : 0)
                .attemptCount(quiz.getAttempts() != null ? quiz.getAttempts().size() : 0)
                .startDate(quiz.getStartDate())
                .endDate(quiz.getEndDate())
                .createdAt(quiz.getCreatedAt())
                .build();
    }
}
