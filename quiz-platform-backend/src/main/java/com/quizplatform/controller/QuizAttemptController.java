package com.quizplatform.controller;

import com.quizplatform.dto.request.SaveAnswerRequest;
import com.quizplatform.dto.request.SubmitAttemptRequest;
import com.quizplatform.dto.response.*;
import com.quizplatform.security.user.CustomUserDetails;
import com.quizplatform.service.QuizAttemptService;
import com.quizplatform.util.ApiResponse;
import com.quizplatform.util.PagedResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Quiz Attempt & Assessment", description = "Quiz taking, submission, scoring & review APIs")
public class QuizAttemptController {

    private final QuizAttemptService attemptService;

    @PostMapping("/quizzes/{quizId}/attempts/start")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Start a quiz attempt (Student only)")
    public ResponseEntity<ApiResponse<StartAttemptResponse>> startQuiz(
            @PathVariable Long quizId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        StartAttemptResponse response = attemptService.startQuiz(quizId, userDetails.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Quiz attempt started", response));
    }

    @PostMapping("/attempts/{attemptId}/answers")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Save an answer for a question in progress")
    public ResponseEntity<ApiResponse<Void>> saveAnswer(
            @PathVariable Long attemptId,
            @RequestBody SaveAnswerRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        attemptService.saveAnswer(attemptId, request, userDetails.getEmail());
        return ResponseEntity.ok(ApiResponse.success("Answer saved"));
    }

    @PostMapping("/attempts/{attemptId}/submit")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Submit a quiz attempt and calculate score")
    public ResponseEntity<ApiResponse<QuizResultResponse>> submitQuiz(
            @PathVariable Long attemptId,
            @Valid @RequestBody(required = false) SubmitAttemptRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        QuizResultResponse result = attemptService.submitQuiz(attemptId, request, userDetails.getEmail());
        return ResponseEntity.ok(ApiResponse.success("Quiz submitted successfully", result));
    }

    @GetMapping("/attempts/{attemptId}/result")
    @Operation(summary = "Get quiz attempt result")
    public ResponseEntity<ApiResponse<QuizResultResponse>> getResult(
            @PathVariable Long attemptId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        QuizResultResponse result = attemptService.getResult(attemptId, userDetails.getEmail());
        return ResponseEntity.ok(ApiResponse.success("Result retrieved", result));
    }

    @GetMapping("/attempts/{attemptId}/review")
    @Operation(summary = "Review questions and correct answers for completed attempt")
    public ResponseEntity<ApiResponse<AttemptReviewResponse>> getAttemptReview(
            @PathVariable Long attemptId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        AttemptReviewResponse review = attemptService.getAttemptReview(attemptId, userDetails.getEmail());
        return ResponseEntity.ok(ApiResponse.success("Attempt review retrieved", review));
    }

    @GetMapping("/users/me/attempts")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get current student's quiz attempt history")
    public ResponseEntity<ApiResponse<PagedResponse<QuizResultResponse>>> getMyAttempts(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        PagedResponse<QuizResultResponse> response = attemptService.getUserAttempts(userDetails.getEmail(), pageable);
        return ResponseEntity.ok(ApiResponse.success("Attempts retrieved", response));
    }

    @GetMapping("/admin/attempts")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all quiz attempts (Admin only)")
    public ResponseEntity<ApiResponse<PagedResponse<QuizResultResponse>>> getAllAttemptsAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        PagedResponse<QuizResultResponse> response = attemptService.getAllAttemptsAdmin(pageable);
        return ResponseEntity.ok(ApiResponse.success("All attempts retrieved", response));
    }
}
