package com.quizplatform.dto.request;

import jakarta.validation.Valid;
import lombok.Data;

import java.util.List;

@Data
public class SubmitAttemptRequest {
    @Valid
    private List<SaveAnswerRequest> answers;
}
