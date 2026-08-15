package com.quizplatform.mapper;

import com.quizplatform.dto.response.OptionResponse;
import com.quizplatform.dto.response.QuestionResponse;
import com.quizplatform.entity.Option;
import com.quizplatform.entity.Question;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class QuestionMapper {

    // For students during quiz (hide correct answers and explanation)
    public QuestionResponse toQuestionResponse(Question question, boolean includeAnswers) {
        if (question == null) return null;
        return QuestionResponse.builder()
                .id(question.getId())
                .questionText(question.getQuestionText())
                .questionType(question.getQuestionType())
                .marks(question.getMarks())
                .negativeMarks(question.getNegativeMarks())
                .explanation(includeAnswers ? question.getExplanation() : null)
                .orderIndex(question.getOrderIndex())
                .options(mapOptions(question.getOptions(), includeAnswers))
                .createdAt(question.getCreatedAt())
                .build();
    }

    private List<OptionResponse> mapOptions(List<Option> options, boolean includeAnswers) {
        if (options == null) return List.of();
        return options.stream()
                .map(opt -> OptionResponse.builder()
                        .id(opt.getId())
                        .optionText(opt.getOptionText())
                        .isCorrect(includeAnswers ? opt.isCorrect() : null)
                        .build())
                .collect(Collectors.toList());
    }
}
