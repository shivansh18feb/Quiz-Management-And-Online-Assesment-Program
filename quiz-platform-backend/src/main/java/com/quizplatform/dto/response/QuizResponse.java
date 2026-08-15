package com.quizplatform.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.quizplatform.enums.Difficulty;
import com.quizplatform.enums.QuizStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class QuizResponse {
    private Long id;
    private String title;
    private String description;
    private CategoryResponse category;
    private Difficulty difficulty;
    private int durationMinutes;
    private double totalMarks;
    private double passingMarks;
    private QuizStatus status;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private int questionCount;
    private long attemptCount;
    private UserResponse createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
