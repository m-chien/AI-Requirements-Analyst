package com.example.backend.repository;

import com.example.backend.entity.UserStory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;
import java.util.List;

@Repository
public interface UserStoryRepository extends JpaRepository<UserStory, UUID> {
    List<UserStory> findByProjectId(UUID projectId);
    void deleteBySourceId(UUID sourceId);
}
