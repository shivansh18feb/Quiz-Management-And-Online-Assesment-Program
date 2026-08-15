package com.quizplatform.service.impl;

import com.quizplatform.dto.request.UpdateProfileRequest;
import com.quizplatform.dto.request.UserStatusRequest;
import com.quizplatform.dto.response.UserResponse;
import com.quizplatform.entity.User;
import com.quizplatform.enums.Role;
import com.quizplatform.exception.ResourceNotFoundException;
import com.quizplatform.mapper.UserMapper;
import com.quizplatform.repository.UserRepository;
import com.quizplatform.service.UserService;
import com.quizplatform.util.PagedResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<UserResponse> getAllUsers(String search, Role role, Pageable pageable) {
        Page<User> users;
        if ((search == null || search.isBlank()) && role == null) {
            users = userRepository.findAll(pageable);
        } else {
            users = userRepository.findBySearchAndRole(
                    (search != null && !search.isBlank()) ? search : null,
                    role,
                    pageable
            );
        }
        Page<UserResponse> responsePage = users.map(userMapper::toUserResponse);
        return PagedResponse.of(responsePage);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return userMapper.toUserResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long id, UpdateProfileRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        User saved = userRepository.save(user);
        log.info("Admin updated user profile for userId: {}", id);
        return userMapper.toUserResponse(saved);
    }

    @Override
    @Transactional
    public UserResponse updateUserStatus(Long id, UserStatusRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        if (request.getEnabled() != null) {
            user.setEnabled(request.getEnabled());
        }
        if (request.getAccountLocked() != null) {
            user.setAccountLocked(request.getAccountLocked());
        }
        User saved = userRepository.save(user);
        log.info("Admin updated user status for userId: {} enabled={} locked={}",
                id, saved.isEnabled(), saved.isAccountLocked());
        return userMapper.toUserResponse(saved);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        userRepository.delete(user);
        log.info("Admin deleted user with id: {}", id);
    }

    @Override
    public long countStudents() {
        return userRepository.countByRole(Role.ROLE_STUDENT);
    }

    @Override
    public long countAdmins() {
        return userRepository.countByRole(Role.ROLE_ADMIN);
    }

    @Override
    public long countTotal() {
        return userRepository.count();
    }
}
