package com.quizplatform.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.quizplatform.enums.QuestionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class QuestionResponse {
    private Long id;
    private String questionText;
    private QuestionType questionType;
    private double marks;
    private double negativeMarks;
    private String explanation; // Only shown after submission or to admins
    private int orderIndex;
    private List<OptionResponse> options;
    private LocalDateTime createdAt;
}
