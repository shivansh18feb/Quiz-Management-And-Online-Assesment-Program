package com.quizplatform.dto.request;

import com.quizplatform.enums.Difficulty;
import com.quizplatform.enums.QuizStatus;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UpdateQuizRequest {
    @Size(min = 3, max = 200)
    private String title;

    @Size(max = 2000)
    private String description;

    private Long categoryId;
    private Difficulty difficulty;

    @Min(1) @Max(300)
    private Integer durationMinutes;

    @Positive
    private Double totalMarks;

    @PositiveOrZero
    private Double passingMarks;

    private QuizStatus status;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
}
