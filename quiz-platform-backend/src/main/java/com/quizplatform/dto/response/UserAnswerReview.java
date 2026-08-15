package com.quizplatform.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.quizplatform.enums.QuestionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserAnswerReview {
    private Long questionId;
    private String questionText;
    private QuestionType questionType;
    private Long selectedOptionId;
    private String selectedOptionText;
    private Long correctOptionId;
    private String correctOptionText;
    private boolean isCorrect;
    private double marksObtained;
    private double marks;
    private double negativeMarks;
    private String explanation;
    private List<OptionResponse> options;
}
