package com.quizplatform.controller;

import com.quizplatform.dto.response.AdminDashboardStats;
import com.quizplatform.dto.response.StudentDashboardStats;
import com.quizplatform.security.user.CustomUserDetails;
import com.quizplatform.service.QuizAttemptService;
import com.quizplatform.util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Dashboard", description = "Analytics and Dashboard APIs")
public class DashboardController {

    private final QuizAttemptService attemptService;

    @GetMapping("/student")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get student dashboard analytics")
    public ResponseEntity<ApiResponse<StudentDashboardStats>> getStudentDashboard(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        StudentDashboardStats stats = attemptService.getStudentDashboardStats(userDetails.getEmail());
        return ResponseEntity.ok(ApiResponse.success("Student stats retrieved", stats));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get admin dashboard analytics")
    public ResponseEntity<ApiResponse<AdminDashboardStats>> getAdminDashboard() {
        AdminDashboardStats stats = attemptService.getAdminDashboardStats();
        return ResponseEntity.ok(ApiResponse.success("Admin stats retrieved", stats));
    }
}
