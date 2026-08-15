package com.quizplatform.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.quizplatform.enums.AttemptStatus;
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
public class QuizResultResponse {
    private Long attemptId;
    private Long quizId;
    private String quizTitle;
    private String studentName;
    private int totalQuestions;
    private int attemptedQuestions;
    private int correctAnswers;
    private int incorrectAnswers;
    private int unansweredQuestions;
    private double totalMarks;
    private double obtainedMarks;
    private double percentage;
    private boolean isPassed;
    private AttemptStatus status;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private long timeTakenSeconds;
}
