package com.quizplatform.service;

import com.quizplatform.dto.request.UpdateProfileRequest;
import com.quizplatform.dto.request.UserStatusRequest;
import com.quizplatform.dto.response.UserResponse;
import com.quizplatform.enums.Role;
import com.quizplatform.util.PagedResponse;
import org.springframework.data.domain.Pageable;

public interface UserService {
    PagedResponse<UserResponse> getAllUsers(String search, Role role, Pageable pageable);
    UserResponse getUserById(Long id);
    UserResponse updateUser(Long id, UpdateProfileRequest request);
    UserResponse updateUserStatus(Long id, UserStatusRequest request);
    void deleteUser(Long id);
    long countStudents();
    long countAdmins();
    long countTotal();
}
