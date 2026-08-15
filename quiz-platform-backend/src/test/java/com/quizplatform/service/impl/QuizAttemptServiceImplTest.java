package com.quizplatform.service.impl;

import com.quizplatform.dto.response.QuizResultResponse;
import com.quizplatform.dto.response.StartAttemptResponse;
import com.quizplatform.entity.Option;
import com.quizplatform.entity.Question;
import com.quizplatform.entity.Quiz;
import com.quizplatform.entity.QuizAttempt;
import com.quizplatform.entity.User;
import com.quizplatform.enums.AttemptStatus;
import com.quizplatform.enums.QuestionType;
import com.quizplatform.enums.QuizStatus;
import com.quizplatform.enums.Role;
import com.quizplatform.exception.BadRequestException;
import com.quizplatform.mapper.QuestionMapper;
import com.quizplatform.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class QuizAttemptServiceImplTest {

    @Mock
    private QuizAttemptRepository attemptRepository;
    @Mock
    private QuizRepository quizRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private QuestionRepository questionRepository;
    @Mock
    private UserAnswerRepository userAnswerRepository;
    @Mock
    private OptionRepository optionRepository;
    @Mock
    private QuestionMapper questionMapper;

    @InjectMocks
    private QuizAttemptServiceImpl quizAttemptService;

    private User student;
    private Quiz publishedQuiz;

    @BeforeEach
    void setUp() {
        student = User.builder()
                .firstName("Student")
                .lastName("User")
                .email("student@example.com")
                .role(Role.ROLE_STUDENT)
                .build();

        publishedQuiz = Quiz.builder()
                .title("Java Fundamentals")
                .status(QuizStatus.PUBLISHED)
                .durationMinutes(30)
                .totalMarks(100.0)
                .passingMarks(40.0)
                .build();
    }

    @Test
    @DisplayName("Should successfully start a quiz attempt for published quiz")
    void testStartQuizSuccess() {
        when(userRepository.findByEmail("student@example.com")).thenReturn(Optional.of(student));
        when(quizRepository.findById(1L)).thenReturn(Optional.of(publishedQuiz));
        when(attemptRepository.findByUserIdAndQuizIdAndStatus(any(), any(), any())).thenReturn(Optional.empty());

        QuizAttempt savedAttempt = QuizAttempt.builder()
                .user(student)
                .quiz(publishedQuiz)
                .startTime(LocalDateTime.now())
                .endTime(LocalDateTime.now().plusMinutes(30))
                .status(AttemptStatus.IN_PROGRESS)
                .build();

        when(attemptRepository.save(any())).thenReturn(savedAttempt);
        when(questionRepository.findByQuizIdOrderByOrderIndex(1L)).thenReturn(List.of());

        StartAttemptResponse response = quizAttemptService.startQuiz(1L, "student@example.com");

        assertNotNull(response);
        assertEquals(30, response.getDurationMinutes());
        verify(attemptRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("Should throw exception when attempting a DRAFT quiz")
    void testStartQuizNotPublished() {
        publishedQuiz.setStatus(QuizStatus.DRAFT);
        when(userRepository.findByEmail("student@example.com")).thenReturn(Optional.of(student));
        when(quizRepository.findById(1L)).thenReturn(Optional.of(publishedQuiz));

        assertThrows(BadRequestException.class, () -> quizAttemptService.startQuiz(1L, "student@example.com"));
        verify(attemptRepository, never()).save(any());
    }
}
