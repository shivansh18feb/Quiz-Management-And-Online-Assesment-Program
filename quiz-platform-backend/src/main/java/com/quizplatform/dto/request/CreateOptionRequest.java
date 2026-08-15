package com.quizplatform.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateOptionRequest {
    @NotBlank(message = "Option text is required")
    private String optionText;
    private boolean isCorrect = false;
}
