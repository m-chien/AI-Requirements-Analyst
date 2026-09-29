package com.example.backend.repository;

import com.example.backend.entity.Requirement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;
import java.util.List;

@Repository
public interface RequirementRepository extends JpaRepository<Requirement, UUID> {
    List<Requirement> findByProjectId(UUID projectId);
    void deleteBySourceId(UUID sourceId);
}
