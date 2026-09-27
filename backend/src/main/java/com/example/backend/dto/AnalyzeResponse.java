package com.example.backend.dto;

import java.util.List;

public record AnalyzeResponse(
    List<String> actors,
    List<Requirement> requirements,
    List<String> conflicts,
    List<String> ambiguities,
    List<String> missingInformation,
    List<String> stakeholderQuestions,
    List<String> impactAnalysis,
    List<UserStory> userStories
) {
    public record Requirement(
        String id,
        String description,
        String type,
        String module
    ) {}

    public record UserStory(
        String role,
        String action,
        String benefit,
        List<String> acceptanceCriteria
    ) {}
}
