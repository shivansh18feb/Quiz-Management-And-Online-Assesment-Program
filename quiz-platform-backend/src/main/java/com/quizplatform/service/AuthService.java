package com.quizplatform.service;

import com.quizplatform.dto.request.*;
import com.quizplatform.dto.response.AuthResponse;
import com.quizplatform.dto.response.UserResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse refreshToken(RefreshTokenRequest request);
    void logout(String refreshToken);
    void forgotPassword(ForgotPasswordRequest request);
    void resetPassword(ResetPasswordRequest request);
    void changePassword(ChangePasswordRequest request, String email);
    UserResponse getCurrentUser(String email);
    UserResponse updateProfile(UpdateProfileRequest request, String email);
}
