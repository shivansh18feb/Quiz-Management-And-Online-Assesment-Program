package com.quizplatform.service.impl;

import com.quizplatform.dto.request.LoginRequest;
import com.quizplatform.dto.request.RegisterRequest;
import com.quizplatform.dto.response.AuthResponse;
import com.quizplatform.dto.response.UserResponse;
import com.quizplatform.entity.User;
import com.quizplatform.enums.Role;
import com.quizplatform.exception.BadRequestException;
import com.quizplatform.exception.DuplicateResourceException;
import com.quizplatform.mapper.UserMapper;
import com.quizplatform.repository.UserRepository;
import com.quizplatform.security.jwt.JwtUtils;
import com.quizplatform.security.user.CustomUserDetails;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private AuthServiceImpl authService;

    private User sampleUser;
    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .firstName("John")
                .lastName("Doe")
                .email("john@example.com")
                .password("encoded_pass")
                .role(Role.ROLE_STUDENT)
                .enabled(true)
                .accountLocked(false)
                .build();

        registerRequest = new RegisterRequest();
        registerRequest.setFirstName("John");
        registerRequest.setLastName("Doe");
        registerRequest.setEmail("john@example.com");
        registerRequest.setPassword("Password@123");
        registerRequest.setConfirmPassword("Password@123");

        loginRequest = new LoginRequest();
        loginRequest.setEmail("john@example.com");
        loginRequest.setPassword("Password@123");
    }

    @Test
    @DisplayName("Should successfully register a new student")
    void testRegisterSuccess() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded_pass");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);
        when(jwtUtils.generateAccessToken(any())).thenReturn("mock_access_token");
        when(jwtUtils.generateRefreshToken(any())).thenReturn("mock_refresh_token");
        when(userMapper.toUserResponse(any())).thenReturn(UserResponse.builder().email("john@example.com").build());

        AuthResponse response = authService.register(registerRequest);

        assertNotNull(response);
        assertEquals("mock_access_token", response.getAccessToken());
        assertEquals("mock_refresh_token", response.getRefreshToken());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw exception when password confirmation does not match")
    void testRegisterPasswordMismatch() {
        registerRequest.setConfirmPassword("DifferentPass@123");

        assertThrows(BadRequestException.class, () -> authService.register(registerRequest));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw exception when registering with duplicate email")
    void testRegisterDuplicateEmail() {
        when(userRepository.existsByEmail("john@example.com")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> authService.register(registerRequest));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should login successfully with valid credentials")
    void testLoginSuccess() {
        Authentication auth = mock(Authentication.class);
        CustomUserDetails userDetails = new CustomUserDetails(sampleUser);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(auth.getPrincipal()).thenReturn(userDetails);
        when(jwtUtils.generateAccessToken(any())).thenReturn("mock_token");
        when(jwtUtils.generateRefreshToken(any())).thenReturn("mock_refresh");
        when(userMapper.toUserResponse(any())).thenReturn(UserResponse.builder().email("john@example.com").build());

        AuthResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("mock_token", response.getAccessToken());
    }

    @Test
    @DisplayName("Should throw exception on invalid login credentials")
    void testLoginInvalidCredentials() {
        when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("Invalid"));

        assertThrows(BadRequestException.class, () -> authService.login(loginRequest));
    }
}
