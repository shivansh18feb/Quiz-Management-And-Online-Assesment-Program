package com.quizplatform.service.impl;

import com.quizplatform.dto.request.SaveAnswerRequest;
import com.quizplatform.dto.request.SubmitAttemptRequest;
import com.quizplatform.dto.response.*;
import com.quizplatform.entity.*;
import com.quizplatform.enums.AttemptStatus;
import com.quizplatform.enums.QuizStatus;
import com.quizplatform.enums.Role;
import com.quizplatform.exception.BadRequestException;
import com.quizplatform.exception.ForbiddenException;
import com.quizplatform.exception.QuizAttemptException;
import com.quizplatform.exception.ResourceNotFoundException;
import com.quizplatform.mapper.QuestionMapper;
import com.quizplatform.repository.*;
import com.quizplatform.service.QuizAttemptService;
import com.quizplatform.util.PagedResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class QuizAttemptServiceImpl implements QuizAttemptService {

    private final QuizAttemptRepository attemptRepository;
    private final QuizRepository quizRepository;
    private final UserRepository userRepository;
    private final QuestionRepository questionRepository;
    private final UserAnswerRepository userAnswerRepository;
    private final OptionRepository optionRepository;
    private final QuestionMapper questionMapper;

    @Override
    @Transactional
    public StartAttemptResponse startQuiz(Long quizId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz", "id", quizId));

        if (quiz.getStatus() != QuizStatus.PUBLISHED) {
            throw new BadRequestException("Quiz is not available for attempting. Status: " + quiz.getStatus());
        }

        LocalDateTime now = LocalDateTime.now();
        if (quiz.getStartDate() != null && now.isBefore(quiz.getStartDate())) {
            throw new BadRequestException("Quiz has not started yet.");
        }
        if (quiz.getEndDate() != null && now.isAfter(quiz.getEndDate())) {
            throw new BadRequestException("Quiz has already ended.");
        }

        Optional<QuizAttempt> existingAttempt = attemptRepository
                .findByUserIdAndQuizIdAndStatus(user.getId(), quizId, AttemptStatus.IN_PROGRESS);

        QuizAttempt attempt;
        if (existingAttempt.isPresent()) {
            attempt = existingAttempt.get();
        } else {
            attempt = QuizAttempt.builder()
                    .user(user)
                    .quiz(quiz)
                    .startTime(now)
                    .endTime(now.plusMinutes(quiz.getDurationMinutes()))
                    .status(AttemptStatus.IN_PROGRESS)
                    .totalMarks(quiz.getTotalMarks())
                    .build();
            attempt = attemptRepository.save(attempt);
        }

        List<Question> questions = questionRepository.findByQuizIdOrderByOrderIndex(quizId);
        List<QuestionResponse> questionResponses = questions.stream()
                .map(q -> questionMapper.toQuestionResponse(q, false))
                .collect(Collectors.toList());

        return StartAttemptResponse.builder()
                .attemptId(attempt.getId())
                .quizId(quiz.getId())
                .quizTitle(quiz.getTitle())
                .totalQuestions(questions.size())
                .durationMinutes(quiz.getDurationMinutes())
                .startTime(attempt.getStartTime())
                .endTime(attempt.getEndTime())
                .questions(questionResponses)
                .build();
    }

    @Override
    @Transactional
    public void saveAnswer(Long attemptId, SaveAnswerRequest answerRequest, String userEmail) {
        QuizAttempt attempt = getValidAttempt(attemptId, userEmail);

        if (answerRequest.getQuestionId() == null) return;

        Question question = questionRepository.findById(answerRequest.getQuestionId())
                .orElseThrow(() -> new ResourceNotFoundException("Question", "id", answerRequest.getQuestionId()));

        Option selectedOption = null;
        if (answerRequest.getSelectedOptionId() != null) {
            selectedOption = optionRepository.findById(answerRequest.getSelectedOptionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Option", "id", answerRequest.getSelectedOptionId()));
        }

        Optional<UserAnswer> existingAnswer = userAnswerRepository
                .findByAttemptIdAndQuestionId(attemptId, question.getId());

        if (existingAnswer.isPresent()) {
            UserAnswer answer = existingAnswer.get();
            answer.setSelectedOption(selectedOption);
            userAnswerRepository.save(answer);
        } else {
            UserAnswer answer = UserAnswer.builder()
                    .attempt(attempt)
                    .question(question)
                    .selectedOption(selectedOption)
                    .build();
            userAnswerRepository.save(answer);
        }
    }

    @Override
    @Transactional
    public QuizResultResponse submitQuiz(Long attemptId, SubmitAttemptRequest submitRequest, String userEmail) {
        QuizAttempt attempt = getValidAttempt(attemptId, userEmail);

        if (submitRequest != null && submitRequest.getAnswers() != null) {
            for (SaveAnswerRequest ans : submitRequest.getAnswers()) {
                saveAnswer(attemptId, ans, userEmail);
            }
        }

        Quiz quiz = attempt.getQuiz();
        List<Question> questions = questionRepository.findByQuizIdOrderByOrderIndex(quiz.getId());
        List<UserAnswer> savedAnswers = userAnswerRepository.findByAttemptId(attemptId);

        Map<Long, UserAnswer> answerMap = savedAnswers.stream()
                .collect(Collectors.toMap(ans -> ans.getQuestion().getId(), ans -> ans, (a, b) -> a));

        double obtainedMarks = 0;
        int correctCount = 0;
        int incorrectCount = 0;
        int unansweredCount = 0;

        for (Question question : questions) {
            UserAnswer answer = answerMap.get(question.getId());
            if (answer == null || answer.getSelectedOption() == null) {
                unansweredCount++;
                if (answer != null) {
                    answer.setCorrect(false);
                    answer.setMarksObtained(0);
                    userAnswerRepository.save(answer);
                }
            } else {
                Option selected = answer.getSelectedOption();
                if (selected.isCorrect()) {
                    correctCount++;
                    double marks = question.getMarks();
                    obtainedMarks += marks;
                    answer.setCorrect(true);
                    answer.setMarksObtained(marks);
                } else {
                    incorrectCount++;
                    double neg = question.getNegativeMarks();
                    obtainedMarks -= neg;
                    answer.setCorrect(false);
                    answer.setMarksObtained(-neg);
                }
                userAnswerRepository.save(answer);
            }
        }

        obtainedMarks = Math.max(0, obtainedMarks);
        double percentage = (quiz.getTotalMarks() > 0) ? (obtainedMarks / quiz.getTotalMarks()) * 100 : 0;
        boolean passed = obtainedMarks >= quiz.getPassingMarks();

        LocalDateTime submitTime = LocalDateTime.now();
        boolean autoSubmitted = submitTime.isAfter(attempt.getEndTime().plusSeconds(30));

        attempt.setEndTime(submitTime);
        attempt.setScore(obtainedMarks);
        attempt.setPercentage(percentage);
        attempt.setCorrectAnswers(correctCount);
        attempt.setIncorrectAnswers(incorrectCount);
        attempt.setUnansweredQuestions(unansweredCount);
        attempt.setPassed(passed);
        attempt.setStatus(autoSubmitted ? AttemptStatus.AUTO_SUBMITTED : AttemptStatus.SUBMITTED);

        attemptRepository.save(attempt);

        return mapToResultResponse(attempt);
    }

    @Override
    @Transactional(readOnly = true)
    public QuizResultResponse getResult(Long attemptId, String userEmail) {
        QuizAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("QuizAttempt", "id", attemptId));

        validateOwnershipOrAdmin(attempt, userEmail);

        if (attempt.getStatus() == AttemptStatus.IN_PROGRESS) {
            throw new BadRequestException("Quiz attempt is still in progress.");
        }

        return mapToResultResponse(attempt);
    }

    @Override
    @Transactional(readOnly = true)
    public AttemptReviewResponse getAttemptReview(Long attemptId, String userEmail) {
        QuizAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("QuizAttempt", "id", attemptId));

        validateOwnershipOrAdmin(attempt, userEmail);

        if (attempt.getStatus() == AttemptStatus.IN_PROGRESS) {
            throw new BadRequestException("Quiz attempt is still in progress.");
        }

        Quiz quiz = attempt.getQuiz();
        List<Question> questions = questionRepository.findByQuizIdOrderByOrderIndex(quiz.getId());
        List<UserAnswer> userAnswers = userAnswerRepository.findByAttemptId(attemptId);

        Map<Long, UserAnswer> answerMap = userAnswers.stream()
                .collect(Collectors.toMap(ans -> ans.getQuestion().getId(), ans -> ans, (a, b) -> a));

        List<UserAnswerReview> reviews = questions.stream().map(q -> {
            UserAnswer ans = answerMap.get(q.getId());
            Option selectedOpt = (ans != null) ? ans.getSelectedOption() : null;
            Option correctOpt = q.getOptions().stream().filter(Option::isCorrect).findFirst().orElse(null);

            List<OptionResponse> optionResponses = q.getOptions().stream().map(o -> OptionResponse.builder()
                    .id(o.getId())
                    .optionText(o.getOptionText())
                    .isCorrect(o.isCorrect())
                    .build()).collect(Collectors.toList());

            return UserAnswerReview.builder()
                    .questionId(q.getId())
                    .questionText(q.getQuestionText())
                    .questionType(q.getQuestionType())
                    .selectedOptionId(selectedOpt != null ? selectedOpt.getId() : null)
                    .selectedOptionText(selectedOpt != null ? selectedOpt.getOptionText() : null)
                    .correctOptionId(correctOpt != null ? correctOpt.getId() : null)
                    .correctOptionText(correctOpt != null ? correctOpt.getOptionText() : null)
                    .isCorrect(ans != null && ans.isCorrect())
                    .marksObtained(ans != null ? ans.getMarksObtained() : 0)
                    .marks(q.getMarks())
                    .negativeMarks(q.getNegativeMarks())
                    .explanation(q.getExplanation())
                    .options(optionResponses)
                    .build();
        }).collect(Collectors.toList());

        return AttemptReviewResponse.builder()
                .attemptId(attempt.getId())
                .quizTitle(quiz.getTitle())
                .result(mapToResultResponse(attempt))
                .questions(reviews)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<QuizResultResponse> getUserAttempts(String userEmail, Pageable pageable) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        Page<QuizAttempt> page = attemptRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable);
        return PagedResponse.of(page.map(this::mapToResultResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<QuizResultResponse> getAllAttemptsAdmin(Pageable pageable) {
        Page<QuizAttempt> page = attemptRepository.findAll(pageable);
        return PagedResponse.of(page.map(this::mapToResultResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<LeaderboardEntry> getGlobalLeaderboard(Pageable pageable) {
        Page<QuizAttempt> page = attemptRepository.findLeaderboard(pageable);
        List<LeaderboardEntry> entries = new ArrayList<>();
        int rank = pageable.getPageNumber() * pageable.getPageSize() + 1;
        for (QuizAttempt att : page.getContent()) {
            entries.add(mapToLeaderboardEntry(att, rank++));
        }
        return PagedResponse.<LeaderboardEntry>builder()
                .content(entries)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .first(page.isFirst())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<LeaderboardEntry> getQuizLeaderboard(Long quizId, Pageable pageable) {
        Page<QuizAttempt> page = attemptRepository.findByQuizIdOrderByScoreDescPercentageDesc(quizId, pageable);
        List<LeaderboardEntry> entries = new ArrayList<>();
        int rank = pageable.getPageNumber() * pageable.getPageSize() + 1;
        for (QuizAttempt att : page.getContent()) {
            entries.add(mapToLeaderboardEntry(att, rank++));
        }
        return PagedResponse.<LeaderboardEntry>builder()
                .content(entries)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .first(page.isFirst())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public StudentDashboardStats getStudentDashboardStats(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        Page<QuizAttempt> attemptsPage = attemptRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), PageRequest.of(0, 100));
        List<QuizAttempt> attempts = attemptsPage.getContent();

        long totalAttempts = attempts.size();
        long passedQuizzes = attempts.stream().filter(QuizAttempt::isPassed).count();
        long failedQuizzes = totalAttempts - passedQuizzes;
        double averageScore = attempts.stream().mapToDouble(QuizAttempt::getScore).average().orElse(0);
        double averagePercentage = attempts.stream().mapToDouble(QuizAttempt::getPercentage).average().orElse(0);
        double highestScore = attempts.stream().mapToDouble(QuizAttempt::getScore).max().orElse(0);
        double lowestScore = attempts.stream().mapToDouble(QuizAttempt::getScore).min().orElse(0);

        List<QuizResultResponse> recent = attempts.stream()
                .limit(5)
                .map(this::mapToResultResponse)
                .collect(Collectors.toList());

        return StudentDashboardStats.builder()
                .totalAttempts(totalAttempts)
                .passedQuizzes(passedQuizzes)
                .failedQuizzes(failedQuizzes)
                .averageScore(Math.round(averageScore * 100.0) / 100.0)
                .averagePercentage(Math.round(averagePercentage * 100.0) / 100.0)
                .highestScore(highestScore)
                .lowestScore(lowestScore)
                .recentAttempts(recent)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AdminDashboardStats getAdminDashboardStats() {
        long totalUsers = userRepository.count();
        long totalStudents = userRepository.countByRole(Role.ROLE_STUDENT);
        long totalQuizzes = quizRepository.count();
        long publishedQuizzes = quizRepository.countByStatus(QuizStatus.PUBLISHED);
        long totalQuestions = questionRepository.count();
        long totalAttempts = attemptRepository.count();

        Double avgScore = attemptRepository.getAverageScore();
        long passedCount = attemptRepository.countByIsPassedTrue();
        double passRate = (totalAttempts > 0) ? ((double) passedCount / totalAttempts) * 100 : 0;

        return AdminDashboardStats.builder()
                .totalUsers(totalUsers)
                .totalStudents(totalStudents)
                .totalQuizzes(totalQuizzes)
                .publishedQuizzes(publishedQuizzes)
                .totalQuestions(totalQuestions)
                .totalAttempts(totalAttempts)
                .averageScore(Math.round((avgScore != null ? avgScore : 0.0) * 100.0) / 100.0)
                .passRate(Math.round(passRate * 100.0) / 100.0)
                .build();
    }

    private QuizAttempt getValidAttempt(Long attemptId, String userEmail) {
        QuizAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("QuizAttempt", "id", attemptId));

        validateOwnership(attempt, userEmail);

        if (attempt.getStatus() != AttemptStatus.IN_PROGRESS) {
            throw new QuizAttemptException("This quiz attempt has already been submitted.");
        }

        return attempt;
    }

    private void validateOwnership(QuizAttempt attempt, String userEmail) {
        if (!attempt.getUser().getEmail().equalsIgnoreCase(userEmail)) {
            throw new ForbiddenException("You are not authorized to access this attempt.");
        }
    }

    private void validateOwnershipOrAdmin(QuizAttempt attempt, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        if (!attempt.getUser().getEmail().equalsIgnoreCase(userEmail) && user.getRole() != Role.ROLE_ADMIN) {
            throw new ForbiddenException("You are not authorized to view this result.");
        }
    }

    private QuizResultResponse mapToResultResponse(QuizAttempt attempt) {
        long timeTaken = (attempt.getStartTime() != null && attempt.getEndTime() != null)
                ? Duration.between(attempt.getStartTime(), attempt.getEndTime()).getSeconds()
                : 0;

        return QuizResultResponse.builder()
                .attemptId(attempt.getId())
                .quizId(attempt.getQuiz().getId())
                .quizTitle(attempt.getQuiz().getTitle())
                .studentName(attempt.getUser().getFirstName() + " " + attempt.getUser().getLastName())
                .totalQuestions(attempt.getQuiz().getQuestions() != null ? attempt.getQuiz().getQuestions().size() : 0)
                .attemptedQuestions(attempt.getCorrectAnswers() + attempt.getIncorrectAnswers())
                .correctAnswers(attempt.getCorrectAnswers())
                .incorrectAnswers(attempt.getIncorrectAnswers())
                .unansweredQuestions(attempt.getUnansweredQuestions())
                .totalMarks(attempt.getTotalMarks())
                .obtainedMarks(attempt.getScore())
                .percentage(Math.round(attempt.getPercentage() * 100.0) / 100.0)
                .isPassed(attempt.isPassed())
                .status(attempt.getStatus())
                .startTime(attempt.getStartTime())
                .endTime(attempt.getEndTime())
                .timeTakenSeconds(timeTaken)
                .build();
    }

    private LeaderboardEntry mapToLeaderboardEntry(QuizAttempt attempt, int rank) {
        long timeTaken = (attempt.getStartTime() != null && attempt.getEndTime() != null)
                ? Duration.between(attempt.getStartTime(), attempt.getEndTime()).getSeconds()
                : 0;

        return LeaderboardEntry.builder()
                .rank(rank)
                .userId(attempt.getUser().getId())
                .studentName(attempt.getUser().getFirstName() + " " + attempt.getUser().getLastName())
                .quizTitle(attempt.getQuiz().getTitle())
                .score(attempt.getScore())
                .totalMarks(attempt.getTotalMarks())
                .percentage(Math.round(attempt.getPercentage() * 100.0) / 100.0)
                .timeTakenSeconds(timeTaken)
                .submittedAt(attempt.getEndTime())
                .build();
    }
}
