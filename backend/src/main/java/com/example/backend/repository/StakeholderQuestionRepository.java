package com.example.backend.repository;

import com.example.backend.entity.StakeholderQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;
import java.util.List;

@Repository
public interface StakeholderQuestionRepository extends JpaRepository<StakeholderQuestion, UUID> {
    List<StakeholderQuestion> findByProjectId(UUID projectId);
    void deleteBySourceId(UUID sourceId);
}
