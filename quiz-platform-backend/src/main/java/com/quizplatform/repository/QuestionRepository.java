package com.quizplatform.repository;

import com.quizplatform.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByQuizIdOrderByOrderIndex(Long quizId);
    int countByQuizId(Long quizId);
    void deleteByQuizId(Long quizId);
}
