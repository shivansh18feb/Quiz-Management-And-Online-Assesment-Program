package com.quizplatform.dto.request;

import lombok.Data;

@Data
public class SaveAnswerRequest {
    private Long questionId;
    private Long selectedOptionId;
}
