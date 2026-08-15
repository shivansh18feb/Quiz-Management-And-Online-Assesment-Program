package com.quizplatform.controller;

import com.quizplatform.dto.request.CreateQuizRequest;
import com.quizplatform.dto.request.UpdateQuizRequest;
import com.quizplatform.dto.response.QuizResponse;
import com.quizplatform.dto.response.QuizSummaryResponse;
import com.quizplatform.enums.Difficulty;
import com.quizplatform.enums.QuizStatus;
import com.quizplatform.security.user.CustomUserDetails;
import com.quizplatform.service.QuizService;
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
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
@Tag(name = "Quiz Management", description = "Quiz CRUD and management APIs")
public class QuizController {

    private final QuizService quizService;

    // ========== PUBLIC ENDPOINTS ==========

    @GetMapping
    @Operation(summary = "Get published quizzes (public, paginated, filterable)")
    public ResponseEntity<ApiResponse<PagedResponse<QuizSummaryResponse>>> getPublishedQuizzes(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Difficulty difficulty,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        PagedResponse<QuizSummaryResponse> response = quizService.getPublishedQuizzes(search, categoryId, difficulty, pageable);
        return ResponseEntity.ok(ApiResponse.success("Quizzes retrieved successfully", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get quiz details by ID")
    public ResponseEntity<ApiResponse<QuizResponse>> getQuizById(@PathVariable Long id) {
        QuizResponse quiz = quizService.getQuizById(id);
        return ResponseEntity.ok(ApiResponse.success("Quiz retrieved successfully", quiz));
    }

    // ========== ADMIN ENDPOINTS ==========

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get all quizzes with any status (Admin only)")
    public ResponseEntity<ApiResponse<PagedResponse<QuizSummaryResponse>>> getAllQuizzes(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) QuizStatus status,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Difficulty difficulty,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        PagedResponse<QuizSummaryResponse> response = quizService.getAllQuizzes(search, status, categoryId, difficulty, pageable);
        return ResponseEntity.ok(ApiResponse.success("All quizzes retrieved successfully", response));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Create a new quiz (Admin only)")
    public ResponseEntity<ApiResponse<QuizResponse>> createQuiz(
            @Valid @RequestBody CreateQuizRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        QuizResponse created = quizService.createQuiz(request, userDetails.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Quiz created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Update quiz (Admin only)")
    public ResponseEntity<ApiResponse<QuizResponse>> updateQuiz(
            @PathVariable Long id,
            @Valid @RequestBody UpdateQuizRequest request) {
        QuizResponse updated = quizService.updateQuiz(id, request);
        return ResponseEntity.ok(ApiResponse.success("Quiz updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Delete quiz (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteQuiz(@PathVariable Long id) {
        quizService.deleteQuiz(id);
        return ResponseEntity.ok(ApiResponse.success("Quiz deleted successfully"));
    }

    @PatchMapping("/{id}/publish")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Publish quiz (Admin only)")
    public ResponseEntity<ApiResponse<QuizResponse>> publishQuiz(@PathVariable Long id) {
        QuizResponse quiz = quizService.publishQuiz(id);
        return ResponseEntity.ok(ApiResponse.success("Quiz published successfully", quiz));
    }

    @PatchMapping("/{id}/unpublish")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Unpublish quiz - set to DRAFT (Admin only)")
    public ResponseEntity<ApiResponse<QuizResponse>> unpublishQuiz(@PathVariable Long id) {
        QuizResponse quiz = quizService.unpublishQuiz(id);
        return ResponseEntity.ok(ApiResponse.success("Quiz unpublished successfully", quiz));
    }

    @PostMapping("/{id}/duplicate")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Duplicate quiz (Admin only)")
    public ResponseEntity<ApiResponse<QuizResponse>> duplicateQuiz(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        QuizResponse duplicated = quizService.duplicateQuiz(id, userDetails.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Quiz duplicated successfully", duplicated));
    }
}
