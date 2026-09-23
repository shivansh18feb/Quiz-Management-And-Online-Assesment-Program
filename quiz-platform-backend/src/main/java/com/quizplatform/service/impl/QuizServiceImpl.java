package com.quizplatform.service.impl;

import com.quizplatform.dto.request.CreateQuizRequest;
import com.quizplatform.dto.request.UpdateQuizRequest;
import com.quizplatform.dto.response.QuizResponse;
import com.quizplatform.dto.response.QuizSummaryResponse;
import com.quizplatform.entity.Category;
import com.quizplatform.entity.Option;
import com.quizplatform.entity.Question;
import com.quizplatform.entity.Quiz;
import com.quizplatform.entity.User;
import com.quizplatform.enums.Difficulty;
import com.quizplatform.enums.QuizStatus;
import com.quizplatform.exception.BadRequestException;
import com.quizplatform.exception.ResourceNotFoundException;
import com.quizplatform.mapper.QuizMapper;
import com.quizplatform.repository.CategoryRepository;
import com.quizplatform.repository.QuestionRepository;
import com.quizplatform.repository.QuizRepository;
import com.quizplatform.repository.UserRepository;
import com.quizplatform.service.QuizService;
import com.quizplatform.util.PagedResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class QuizServiceImpl implements QuizService {

    private final QuizRepository quizRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final QuestionRepository questionRepository;
    private final QuizMapper quizMapper;

    @Override
    @Transactional
    public QuizResponse createQuiz(CreateQuizRequest request, String creatorEmail) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        User creator = userRepository.findByEmail(creatorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", creatorEmail));

        if (request.getPassingMarks() > request.getTotalMarks()) {
            throw new BadRequestException("Passing marks cannot be greater than total marks");
        }

        Quiz quiz = Quiz.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(category)
                .difficulty(request.getDifficulty())
                .durationMinutes(request.getDurationMinutes())
                .totalMarks(request.getTotalMarks())
                .passingMarks(request.getPassingMarks())
                .status(request.getStatus() != null ? request.getStatus() : QuizStatus.DRAFT)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .createdBy(creator)
                .build();

        Quiz saved = quizRepository.save(quiz);
        log.info("Quiz created: '{}' by {}", saved.getTitle(), creatorEmail);
        return quizMapper.toQuizResponse(saved);
    }

    @Override
    @Transactional
    public QuizResponse updateQuiz(Long id, UpdateQuizRequest request) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz", "id", id));

        if (request.getTitle() != null) quiz.setTitle(request.getTitle());
        if (request.getDescription() != null) quiz.setDescription(request.getDescription());
        if (request.getDifficulty() != null) quiz.setDifficulty(request.getDifficulty());
        if (request.getDurationMinutes() != null) quiz.setDurationMinutes(request.getDurationMinutes());
        if (request.getTotalMarks() != null) quiz.setTotalMarks(request.getTotalMarks());
        if (request.getPassingMarks() != null) quiz.setPassingMarks(request.getPassingMarks());
        if (request.getStatus() != null) quiz.setStatus(request.getStatus());
        if (request.getStartDate() != null) quiz.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) quiz.setEndDate(request.getEndDate());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
            quiz.setCategory(category);
        }

        if (quiz.getPassingMarks() > quiz.getTotalMarks()) {
            throw new BadRequestException("Passing marks cannot be greater than total marks");
        }

        Quiz saved = quizRepository.save(quiz);
        log.info("Quiz updated: '{}' (id: {})", saved.getTitle(), id);
        return quizMapper.toQuizResponse(saved);
    }

    @Override
    @Transactional
    public void deleteQuiz(Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz", "id", id));
        quizRepository.delete(quiz);
        log.info("Quiz deleted with id: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public QuizResponse getQuizById(Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz", "id", id));
        return quizMapper.toQuizResponse(quiz);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<QuizSummaryResponse> getAllQuizzes(
            String search, QuizStatus status, Long categoryId, Difficulty difficulty, Pageable pageable) {
        Page<Quiz> quizPage = quizRepository.findByFilters(
                (search != null && !search.isBlank()) ? search : "",
                status, categoryId, difficulty, pageable);
        Page<QuizSummaryResponse> responsePage = quizPage.map(quizMapper::toQuizSummaryResponse);
        return PagedResponse.of(responsePage);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<QuizSummaryResponse> getPublishedQuizzes(
            String search, Long categoryId, Difficulty difficulty, Pageable pageable) {
        Page<Quiz> quizPage = quizRepository.findByFilters(
        (search != null && !search.isBlank()) ? search : "",
        QuizStatus.PUBLISHED, categoryId, difficulty, pageable);
        Page<QuizSummaryResponse> responsePage = quizPage.map(quizMapper::toQuizSummaryResponse);
        return PagedResponse.of(responsePage);
    }

    @Override
    @Transactional
    public QuizResponse publishQuiz(Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz", "id", id));
        int questionCount = questionRepository.countByQuizId(id);
        if (questionCount == 0) {
            throw new BadRequestException("Cannot publish a quiz with no questions. Please add at least one question.");
        }
        quiz.setStatus(QuizStatus.PUBLISHED);
        Quiz saved = quizRepository.save(quiz);
        log.info("Quiz published: '{}' (id: {})", saved.getTitle(), id);
        return quizMapper.toQuizResponse(saved);
    }

    @Override
    @Transactional
    public QuizResponse unpublishQuiz(Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz", "id", id));
        quiz.setStatus(QuizStatus.DRAFT);
        Quiz saved = quizRepository.save(quiz);
        log.info("Quiz unpublished: '{}' (id: {})", saved.getTitle(), id);
        return quizMapper.toQuizResponse(saved);
    }

    @Override
    @Transactional
    public QuizResponse duplicateQuiz(Long id, String creatorEmail) {
        Quiz original = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz", "id", id));
        User creator = userRepository.findByEmail(creatorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", creatorEmail));

        Quiz copy = Quiz.builder()
                .title("Copy of " + original.getTitle())
                .description(original.getDescription())
                .category(original.getCategory())
                .difficulty(original.getDifficulty())
                .durationMinutes(original.getDurationMinutes())
                .totalMarks(original.getTotalMarks())
                .passingMarks(original.getPassingMarks())
                .status(QuizStatus.DRAFT)
                .startDate(original.getStartDate())
                .endDate(original.getEndDate())
                .createdBy(creator)
                .build();

        Quiz savedCopy = quizRepository.save(copy);

        List<Question> originalQuestions = questionRepository.findByQuizIdOrderByOrderIndex(id);
        for (Question origQ : originalQuestions) {
            Question newQ = Question.builder()
                    .quiz(savedCopy)
                    .questionText(origQ.getQuestionText())
                    .questionType(origQ.getQuestionType())
                    .marks(origQ.getMarks())
                    .negativeMarks(origQ.getNegativeMarks())
                    .explanation(origQ.getExplanation())
                    .orderIndex(origQ.getOrderIndex())
                    .build();

            List<Option> newOptions = new ArrayList<>();
            for (Option origOpt : origQ.getOptions()) {
                Option newOpt = Option.builder()
                        .question(newQ)
                        .optionText(origOpt.getOptionText())
                        .isCorrect(origOpt.isCorrect())
                        .build();
                newOptions.add(newOpt);
            }
            newQ.setOptions(newOptions);
            savedCopy.getQuestions().add(newQ);
        }

        Quiz finalCopy = quizRepository.save(savedCopy);
        log.info("Quiz duplicated: original id={}, copy id={}", id, finalCopy.getId());
        return quizMapper.toQuizResponse(finalCopy);
    }

    @Override
    public long countByStatus(QuizStatus status) {
        return quizRepository.countByStatus(status);
    }

    @Override
    public long countAll() {
        return quizRepository.count();
    }
}
