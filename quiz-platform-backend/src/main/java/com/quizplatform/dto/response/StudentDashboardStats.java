package com.quizplatform.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentDashboardStats {
    private long totalAttempts;
    private long passedQuizzes;
    private long failedQuizzes;
    private double averageScore;
    private double averagePercentage;
    private double highestScore;
    private double lowestScore;
    private List<QuizResultResponse> recentAttempts;
}
