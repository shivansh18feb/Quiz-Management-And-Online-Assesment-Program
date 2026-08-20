package com.quizplatform.repository;

import com.quizplatform.entity.QuizAttempt;
import com.quizplatform.enums.AttemptStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {

    Page<QuizAttempt> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Page<QuizAttempt> findByQuizIdOrderByScoreDescPercentageDesc(Long quizId, Pageable pageable);

    Optional<QuizAttempt> findByUserIdAndQuizIdAndStatus(Long userId, Long quizId, AttemptStatus status);

    boolean existsByUserIdAndQuizIdAndStatus(Long userId, Long quizId, AttemptStatus status);

    long countByUserId(Long userId);

    long countByIsPassedTrue();

    @Query("SELECT COALESCE(AVG(qa.score), 0.0) FROM QuizAttempt qa WHERE qa.status = 'SUBMITTED' OR qa.status = 'AUTO_SUBMITTED'")
    Double getAverageScore();

    @Query("SELECT qa FROM QuizAttempt qa WHERE qa.status = 'SUBMITTED' OR qa.status = 'AUTO_SUBMITTED' ORDER BY qa.score DESC")
    Page<QuizAttempt> findLeaderboard(Pageable pageable);
}
