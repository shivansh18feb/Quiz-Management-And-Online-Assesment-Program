package com.quizplatform.dto.request;

import com.quizplatform.enums.Difficulty;
import com.quizplatform.enums.QuizStatus;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateQuizRequest {
    @NotBlank(message = "Quiz title is required")
    @Size(min = 3, max = 200, message = "Title must be between 3 and 200 characters")
    private String title;

    @Size(max = 2000, message = "Description cannot exceed 2000 characters")
    private String description;

    @NotNull(message = "Category is required")
    private Long categoryId;

    @NotNull(message = "Difficulty is required")
    private Difficulty difficulty;

    @NotNull(message = "Duration is required")
    @Min(value = 1, message = "Duration must be at least 1 minute")
    @Max(value = 300, message = "Duration cannot exceed 300 minutes")
    private Integer durationMinutes;

    @NotNull(message = "Total marks is required")
    @Positive(message = "Total marks must be positive")
    private Double totalMarks;

    @NotNull(message = "Passing marks is required")
    @PositiveOrZero(message = "Passing marks must be zero or positive")
    private Double passingMarks;

    private QuizStatus status = QuizStatus.DRAFT;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
}
