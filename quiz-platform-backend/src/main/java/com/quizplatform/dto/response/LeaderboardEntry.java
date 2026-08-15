package com.quizplatform.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardEntry {
    private int rank;
    private Long userId;
    private String studentName;
    private String quizTitle;
    private double score;
    private double totalMarks;
    private double percentage;
    private long timeTakenSeconds;
    private LocalDateTime submittedAt;
}
