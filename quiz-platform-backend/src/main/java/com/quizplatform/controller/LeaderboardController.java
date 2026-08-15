package com.quizplatform.controller;

import com.quizplatform.dto.response.LeaderboardEntry;
import com.quizplatform.service.QuizAttemptService;
import com.quizplatform.util.ApiResponse;
import com.quizplatform.util.PagedResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Leaderboard", description = "Leaderboard rankings APIs")
public class LeaderboardController {

    private final QuizAttemptService attemptService;

    @GetMapping("/leaderboard")
    @Operation(summary = "Get global leaderboard rankings")
    public ResponseEntity<ApiResponse<PagedResponse<LeaderboardEntry>>> getGlobalLeaderboard(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        PagedResponse<LeaderboardEntry> leaderboard = attemptService.getGlobalLeaderboard(pageable);
        return ResponseEntity.ok(ApiResponse.success("Global leaderboard retrieved", leaderboard));
    }

    @GetMapping("/quizzes/{quizId}/leaderboard")
    @Operation(summary = "Get leaderboard for a specific quiz")
    public ResponseEntity<ApiResponse<PagedResponse<LeaderboardEntry>>> getQuizLeaderboard(
            @PathVariable Long quizId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        PagedResponse<LeaderboardEntry> leaderboard = attemptService.getQuizLeaderboard(quizId, pageable);
        return ResponseEntity.ok(ApiResponse.success("Quiz leaderboard retrieved", leaderboard));
    }
}
