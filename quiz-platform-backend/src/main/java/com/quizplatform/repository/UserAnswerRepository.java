package com.quizplatform.repository;

import com.quizplatform.entity.UserAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserAnswerRepository extends JpaRepository<UserAnswer, Long> {
    List<UserAnswer> findByAttemptId(Long attemptId);
    Optional<UserAnswer> findByAttemptIdAndQuestionId(Long attemptId, Long questionId);
}
