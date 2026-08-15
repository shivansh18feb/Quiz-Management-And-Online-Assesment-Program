package com.quizplatform.dto.request;

import com.quizplatform.enums.QuestionType;
import jakarta.validation.Valid;
import lombok.Data;

import java.util.List;

@Data
public class UpdateQuestionRequest {
    private String questionText;
    private QuestionType questionType;
    private Double marks;
    private Double negativeMarks;
    private String explanation;
    private Integer orderIndex;
    @Valid
    private List<CreateOptionRequest> options;
}
