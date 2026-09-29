package com.example.backend.repository;

import com.example.backend.entity.AnalysisIssue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;
import java.util.List;

@Repository
public interface AnalysisIssueRepository extends JpaRepository<AnalysisIssue, UUID> {
    List<AnalysisIssue> findByProjectId(UUID projectId);
    void deleteBySourceId(UUID sourceId);
}
