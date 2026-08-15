package com.quizplatform.dto.request;

import lombok.Data;

@Data
public class UserStatusRequest {
    private Boolean enabled;
    private Boolean accountLocked;
}
