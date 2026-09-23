package com.quizplatform.repository;

import com.quizplatform.entity.Quiz;
import com.quizplatform.enums.Difficulty;
import com.quizplatform.enums.QuizStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {

    Page<Quiz> findByStatus(QuizStatus status, Pageable pageable);

    Page<Quiz> findByCategoryId(Long categoryId, Pageable pageable);

    @Query("SELECT q FROM Quiz q WHERE " +
           "(:search IS NULL OR " +
           "LOWER(q.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(COALESCE(q.description, '')) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:status IS NULL OR q.status = :status) " +
           "AND (:categoryId IS NULL OR q.category.id = :categoryId) " +
           "AND (:difficulty IS NULL OR q.difficulty = :difficulty)")
    Page<Quiz> findByFilters(
            @Param("search") String search,
            @Param("status") QuizStatus status,
            @Param("categoryId") Long categoryId,
            @Param("difficulty") Difficulty difficulty,
            Pageable pageable
    );

    long countByStatus(QuizStatus status);

    int countByCategoryId(Long categoryId);
}