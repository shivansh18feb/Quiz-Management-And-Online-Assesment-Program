package com.quizplatform.dto.request;

import com.quizplatform.enums.QuestionType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.List;

@Data
public class CreateQuestionRequest {
    @NotBlank(message = "Question text is required")
    private String questionText;

    @NotNull(message = "Question type is required")
    private QuestionType questionType;

    @Positive(message = "Marks must be positive")
    private double marks = 1.0;

    @PositiveOrZero(message = "Negative marks must be zero or positive")
    private double negativeMarks = 0.0;

    private String explanation;

    @Min(value = 0, message = "Order index must be non-negative")
    private int orderIndex = 0;

    @NotNull(message = "Options are required")
    @Size(min = 2, max = 6, message = "Question must have between 2 and 6 options")
    @Valid
    private List<CreateOptionRequest> options;
}
