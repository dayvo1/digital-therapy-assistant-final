package com.digitaltherapy.repository;

import com.digitaltherapy.entity.DiaryEntry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DiaryEntryRepository extends JpaRepository<DiaryEntry, UUID> {

    @EntityGraph(attributePaths = {"distortions"})
    Page<DiaryEntry> findByUserIdAndDeletedFalseOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    @Query("SELECT d.id, d.name, COUNT(de) FROM DiaryEntry de JOIN de.distortions d WHERE de.user.id = :userId AND de.deleted = false GROUP BY d.id, d.name ORDER BY COUNT(de) DESC")
    List<Object[]> findTopDistortionsByUserId(@Param("userId") UUID userId);

    @Query("SELECT AVG(de.moodAfter - de.moodBefore) FROM DiaryEntry de WHERE de.user.id = :userId AND de.deleted = false AND de.moodBefore IS NOT NULL AND de.moodAfter IS NOT NULL")
    Double calculateAverageMoodImprovement(@Param("userId") UUID userId);
}
