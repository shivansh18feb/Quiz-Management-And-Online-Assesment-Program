package com.quizplatform.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardStats {
    private long totalUsers;
    private long totalStudents;
    private long totalQuizzes;
    private long publishedQuizzes;
    private long totalQuestions;
    private long totalAttempts;
    private double averageScore;
    private double passRate;
}
