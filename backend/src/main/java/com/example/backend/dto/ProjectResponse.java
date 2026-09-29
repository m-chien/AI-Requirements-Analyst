package com.example.backend.dto;

import lombok.*;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectResponse {
    private String id;
    private String name;
    private String description;
    private String status;
    private List<String> actors;
    
    // Nests
    private List<Object> sources;
    private List<Object> requirements;
    private List<Object> userStories;
    private List<Object> ambiguities;
    private List<Object> conflicts;
    private List<Object> missingInfo;
    private List<Object> questions;
}
