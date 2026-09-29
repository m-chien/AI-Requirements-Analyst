package com.example.backend.repository;

import com.example.backend.entity.Source;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;
import java.util.List;

@Repository
public interface SourceRepository extends JpaRepository<Source, UUID> {
    List<Source> findByProjectIdOrderByCreatedAtAsc(UUID projectId);
}
