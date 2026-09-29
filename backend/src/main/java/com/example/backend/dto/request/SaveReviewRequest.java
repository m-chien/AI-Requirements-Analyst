package com.example.backend.dto.request;

import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class SaveReviewRequest {
    private UUID sourceId;
    private List<RequirementData> requirements;
    private List<UserStoryData> userStories;
    private List<IssueData> ambiguities;
    private List<IssueData> conflicts;
    private List<IssueData> missingInfo;
    private List<QuestionData> questions;

    @Data
    public static class RequirementData {
        private String id; // có thể là UUID thật hoặc "REQ-1234"
        private String text;
        private String module;
        private String type;
        private String traceability;
        private String status;
        private String sourceEvidence;
    }

    @Data
    public static class UserStoryData {
        private String id;
        private String role;
        private String action;
        private String benefit;
        private List<String> acceptanceCriteria;
        private String status;
    }

    @Data
    public static class IssueData {
        private String id;
        private String description;
        private String problem; // Dành cho ambiguity trong frontend (có thể map vào description)
        private String status;
    }

    @Data
    public static class QuestionData {
        private String id;
        private String question;
        private String status;
        private String answer; // Câu trả lời từ stakeholder
    }
}
