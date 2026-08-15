package com.quizplatform.controller;

import com.quizplatform.dto.request.CreateQuestionRequest;
import com.quizplatform.dto.request.UpdateQuestionRequest;
import com.quizplatform.dto.response.QuestionResponse;
import com.quizplatform.service.QuestionService;
import com.quizplatform.util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Question Management", description = "Quiz question management APIs")
public class QuestionController {

    private final QuestionService questionService;

    @GetMapping("/quizzes/{quizId}/questions")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all questions for a quiz with answers (Admin only)")
    public ResponseEntity<ApiResponse<List<QuestionResponse>>> getQuestionsAdmin(
            @PathVariable Long quizId) {
        List<QuestionResponse> questions = questionService.getQuestionsByQuizId(quizId, true);
        return ResponseEntity.ok(ApiResponse.success("Questions retrieved successfully", questions));
    }

    @PostMapping("/quizzes/{quizId}/questions")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Add a question to a quiz (Admin only)")
    public ResponseEntity<ApiResponse<QuestionResponse>> addQuestion(
            @PathVariable Long quizId,
            @Valid @RequestBody CreateQuestionRequest request) {
        QuestionResponse question = questionService.addQuestion(quizId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Question added successfully", question));
    }

    @PutMapping("/questions/{questionId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update a question (Admin only)")
    public ResponseEntity<ApiResponse<QuestionResponse>> updateQuestion(
            @PathVariable Long questionId,
            @Valid @RequestBody UpdateQuestionRequest request) {
        QuestionResponse question = questionService.updateQuestion(questionId, request);
        return ResponseEntity.ok(ApiResponse.success("Question updated successfully", question));
    }

    @DeleteMapping("/questions/{questionId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a question (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteQuestion(@PathVariable Long questionId) {
        questionService.deleteQuestion(questionId);
        return ResponseEntity.ok(ApiResponse.success("Question deleted successfully"));
    }

    @GetMapping("/questions/{questionId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get a specific question by ID with answers (Admin only)")
    public ResponseEntity<ApiResponse<QuestionResponse>> getQuestionById(@PathVariable Long questionId) {
        QuestionResponse question = questionService.getQuestionById(questionId, true);
        return ResponseEntity.ok(ApiResponse.success("Question retrieved successfully", question));
    }
}
