package com.quizplatform.service.impl;

import com.quizplatform.dto.request.CreateOptionRequest;
import com.quizplatform.dto.request.CreateQuestionRequest;
import com.quizplatform.dto.request.UpdateQuestionRequest;
import com.quizplatform.dto.response.QuestionResponse;
import com.quizplatform.entity.Option;
import com.quizplatform.entity.Question;
import com.quizplatform.entity.Quiz;
import com.quizplatform.exception.BadRequestException;
import com.quizplatform.exception.ResourceNotFoundException;
import com.quizplatform.mapper.QuestionMapper;
import com.quizplatform.repository.QuestionRepository;
import com.quizplatform.repository.QuizRepository;
import com.quizplatform.service.QuestionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class QuestionServiceImpl implements QuestionService {

    private final QuestionRepository questionRepository;
    private final QuizRepository quizRepository;
    private final QuestionMapper questionMapper;

    @Override
    @Transactional
    public QuestionResponse addQuestion(Long quizId, CreateQuestionRequest request) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz", "id", quizId));

        validateOptions(request.getOptions(), request.getQuestionType().name());

        Question question = Question.builder()
                .quiz(quiz)
                .questionText(request.getQuestionText())
                .questionType(request.getQuestionType())
                .marks(request.getMarks())
                .negativeMarks(request.getNegativeMarks())
                .explanation(request.getExplanation())
                .orderIndex(request.getOrderIndex())
                .build();

        List<Option> options = buildOptions(request.getOptions(), question);
        question.setOptions(options);

        Question saved = questionRepository.save(question);
        log.info("Question added to quiz id={}: '{}'", quizId, saved.getQuestionText().substring(0, Math.min(50, saved.getQuestionText().length())));
        return questionMapper.toQuestionResponse(saved, true);
    }

    @Override
    @Transactional
    public QuestionResponse updateQuestion(Long questionId, UpdateQuestionRequest request) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question", "id", questionId));

        if (request.getQuestionText() != null) question.setQuestionText(request.getQuestionText());
        if (request.getQuestionType() != null) question.setQuestionType(request.getQuestionType());
        if (request.getMarks() != null) question.setMarks(request.getMarks());
        if (request.getNegativeMarks() != null) question.setNegativeMarks(request.getNegativeMarks());
        if (request.getExplanation() != null) question.setExplanation(request.getExplanation());
        if (request.getOrderIndex() != null) question.setOrderIndex(request.getOrderIndex());

        if (request.getOptions() != null && !request.getOptions().isEmpty()) {
            validateOptions(request.getOptions(), question.getQuestionType().name());
            question.getOptions().clear();
            List<Option> newOptions = buildOptions(request.getOptions(), question);
            question.getOptions().addAll(newOptions);
        }

        Question saved = questionRepository.save(question);
        log.info("Question updated id={}", questionId);
        return questionMapper.toQuestionResponse(saved, true);
    }

    @Override
    @Transactional
    public void deleteQuestion(Long questionId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question", "id", questionId));
        questionRepository.delete(question);
        log.info("Question deleted id={}", questionId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuestionResponse> getQuestionsByQuizId(Long quizId, boolean includeAnswers) {
        if (!quizRepository.existsById(quizId)) {
            throw new ResourceNotFoundException("Quiz", "id", quizId);
        }
        return questionRepository.findByQuizIdOrderByOrderIndex(quizId).stream()
                .map(q -> questionMapper.toQuestionResponse(q, includeAnswers))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public QuestionResponse getQuestionById(Long questionId, boolean includeAnswers) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question", "id", questionId));
        return questionMapper.toQuestionResponse(question, includeAnswers);
    }

    @Override
    public long countByQuizId(Long quizId) {
        return questionRepository.countByQuizId(quizId);
    }

    private void validateOptions(List<CreateOptionRequest> options, String questionType) {
        long correctCount = options.stream().filter(CreateOptionRequest::isCorrect).count();
        if (correctCount == 0) {
            throw new BadRequestException("At least one option must be marked as correct");
        }
        if ((questionType.equals("SINGLE_CORRECT") || questionType.equals("TRUE_FALSE")) && correctCount > 1) {
            throw new BadRequestException("This question type can only have one correct answer");
        }
        if (questionType.equals("TRUE_FALSE") && options.size() != 2) {
            throw new BadRequestException("True/False question must have exactly 2 options");
        }
    }

    private List<Option> buildOptions(List<CreateOptionRequest> optionRequests, Question question) {
        List<Option> options = new ArrayList<>();
        for (CreateOptionRequest req : optionRequests) {
            Option option = Option.builder()
                    .question(question)
                    .optionText(req.getOptionText())
                    .isCorrect(req.isCorrect())
                    .build();
            options.add(option);
        }
        return options;
    }
}
