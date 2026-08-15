package com.quizplatform.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.quizplatform.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String fullName;
    private Role role;
    private boolean enabled;
    private boolean accountLocked;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
