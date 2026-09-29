package com.example.backend.controller;

import com.example.backend.config.DatabaseSeeder;
import com.example.backend.entity.*;
import com.example.backend.repository.*;
import com.example.backend.dto.request.SaveReviewRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "*")
public class ProjectController {

    @Autowired private ProjectRepository projectRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private SourceRepository sourceRepository;
    @Autowired private RequirementRepository requirementRepository;
    @Autowired private UserStoryRepository userStoryRepository;
    @Autowired private AnalysisIssueRepository analysisIssueRepository;
    @Autowired private StakeholderQuestionRepository questionRepository;
    @Autowired private ExportedFileRepository exportedFileRepository;

    @PostMapping
    public Project createProject(@RequestBody Project request) {
        User user = userRepository.findById(DatabaseSeeder.DEFAULT_USER_ID)
                .orElseThrow(() -> new RuntimeException("Default User not found"));
        
        Project project = Project.builder()
                .name(request.getName())
                .description(request.getDescription())
                .status("Draft")
                .user(user)
                .build();
        return projectRepository.save(project);
    }

    @GetMapping
    public List<Project> getAllProjects() {
        return projectRepository.findByUserIdOrderByCreatedAtDesc(DatabaseSeeder.DEFAULT_USER_ID);
    }

    @GetMapping("/{id}")
    public java.util.Map<String, Object> getProjectById(@PathVariable UUID id) {
        Project project = projectRepository.findById(id).orElseThrow(() -> new RuntimeException("Project not found"));
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("id", project.getId());
        response.put("name", project.getName());
        response.put("description", project.getDescription());
        response.put("status", project.getStatus());
        response.put("sources", sourceRepository.findByProjectIdOrderByCreatedAtAsc(id));
        
        List<java.util.Map<String, Object>> reqs = new java.util.ArrayList<>();
        for(Requirement r : requirementRepository.findByProjectId(id)) {
            java.util.Map<String, Object> rm = new java.util.HashMap<>();
            rm.put("id", r.getId());
            rm.put("text", r.getDescription());
            rm.put("module", r.getModule());
            rm.put("type", r.getType());
            rm.put("traceability", r.getTraceability());
            rm.put("status", r.getStatus());
            reqs.add(rm);
        }
        response.put("requirements", reqs);
        response.put("userStories", userStoryRepository.findByProjectId(id));
        
        List<AnalysisIssue> issues = analysisIssueRepository.findByProjectId(id);
        List<java.util.Map<String, Object>> amb = new java.util.ArrayList<>();
        List<java.util.Map<String, Object>> conf = new java.util.ArrayList<>();
        List<java.util.Map<String, Object>> miss = new java.util.ArrayList<>();
        
        for (AnalysisIssue issue : issues) {
            java.util.Map<String, Object> im = new java.util.HashMap<>();
            im.put("id", issue.getId());
            im.put("status", issue.getStatus());
            if (issue.getIssueType() == AnalysisIssue.IssueType.AMBIGUITY) {
                im.put("problem", issue.getDescription());
                amb.add(im);
            } else if (issue.getIssueType() == AnalysisIssue.IssueType.CONFLICT) {
                im.put("description", issue.getDescription());
                conf.add(im);
            } else {
                im.put("description", issue.getDescription());
                miss.add(im);
            }
        }
        response.put("ambiguities", amb);
        response.put("conflicts", conf);
        response.put("missingInfo", miss);
        response.put("questions", questionRepository.findByProjectId(id));
        
        return response;
    }

    @PostMapping("/{id}/sources")
    public Source createSource(@PathVariable UUID id, @RequestBody Source request) {
        Project project = projectRepository.findById(id).orElseThrow();
        Source source = Source.builder()
                .project(project)
                .title(request.getTitle())
                .type(request.getType())
                .content(request.getContent())
                .status("Draft")
                .build();
        return sourceRepository.save(source);
    }

    @Transactional
    @PutMapping("/{id}/save-review")
    public Project saveReview(@PathVariable UUID id, @RequestBody SaveReviewRequest request) {
        Project project = projectRepository.findById(id).orElseThrow();
        Source source = sourceRepository.findById(request.getSourceId()).orElseThrow();
        
        requirementRepository.deleteBySourceId(source.getId());
        userStoryRepository.deleteBySourceId(source.getId());
        analysisIssueRepository.deleteBySourceId(source.getId());
        questionRepository.deleteBySourceId(source.getId());

        if (request.getRequirements() != null) {
            for (SaveReviewRequest.RequirementData r : request.getRequirements()) {
                requirementRepository.save(Requirement.builder()
                        .project(project).source(source).description(r.getText())
                        .module(r.getModule() != null ? r.getModule() : "General")
                        .type(r.getType() != null ? r.getType() : "Functional")
                        .traceability(r.getTraceability() != null ? r.getTraceability() : "INFERRED")
                        .status(r.getStatus() != null ? r.getStatus() : "Draft")
                        .build());
            }
        }
        
        if (request.getUserStories() != null) {
            for (SaveReviewRequest.UserStoryData us : request.getUserStories()) {
                userStoryRepository.save(UserStory.builder()
                        .project(project).source(source).role(us.getRole())
                        .action(us.getAction()).benefit(us.getBenefit())
                        .acceptanceCriteria(us.getAcceptanceCriteria())
                        .status(us.getStatus() != null ? us.getStatus() : "Draft")
                        .build());
            }
        }

        if (request.getAmbiguities() != null) {
            for (SaveReviewRequest.IssueData am : request.getAmbiguities()) {
                analysisIssueRepository.save(AnalysisIssue.builder()
                        .project(project).source(source).issueType(AnalysisIssue.IssueType.AMBIGUITY)
                        .description(am.getProblem() != null ? am.getProblem() : am.getDescription())
                        .status(am.getStatus() != null ? am.getStatus() : "Needs Clarification")
                        .build());
            }
        }

        if (request.getConflicts() != null) {
            for (SaveReviewRequest.IssueData cf : request.getConflicts()) {
                analysisIssueRepository.save(AnalysisIssue.builder()
                        .project(project).source(source).issueType(AnalysisIssue.IssueType.CONFLICT)
                        .description(cf.getDescription())
                        .status(cf.getStatus() != null ? cf.getStatus() : "Needs Clarification")
                        .build());
            }
        }

        if (request.getMissingInfo() != null) {
            for (SaveReviewRequest.IssueData mi : request.getMissingInfo()) {
                analysisIssueRepository.save(AnalysisIssue.builder()
                        .project(project).source(source).issueType(AnalysisIssue.IssueType.MISSING_INFO)
                        .description(mi.getDescription())
                        .status(mi.getStatus() != null ? mi.getStatus() : "Needs Clarification")
                        .build());
            }
        }

        if (request.getQuestions() != null) {
            for (SaveReviewRequest.QuestionData q : request.getQuestions()) {
                questionRepository.save(StakeholderQuestion.builder()
                        .project(project).source(source).targetStakeholder("General")
                        .question(q.getQuestion())
                        .status(q.getStatus() != null ? q.getStatus() : "Open")
                        .answer(q.getAnswer())
                        .build());
            }
        }
        
        return projectRepository.findById(id).orElseThrow();
    }

    @PostMapping("/{id}/export")
    public org.springframework.http.ResponseEntity<String> exportProject(@PathVariable UUID id) {
        Project project = projectRepository.findById(id).orElseThrow();
        
        List<Requirement> requirements = requirementRepository.findByProjectId(id);
        List<UserStory> userStories = userStoryRepository.findByProjectId(id);
        
        StringBuilder md = new StringBuilder();
        md.append("# Project: ").append(project.getName()).append("\n\n");
        md.append(project.getDescription()).append("\n\n");
        
        md.append("## Requirements (Approved)\n\n");
        for (Requirement r : requirements) {
            if ("Approved".equals(r.getStatus())) {
                md.append("- **[").append(r.getModule()).append("]**: ")
                  .append(r.getDescription())
                  .append(" *(Type: ").append(r.getType()).append(")*\n");
            }
        }
        
        md.append("\n## User Stories (Approved)\n\n");
        for (UserStory us : userStories) {
            if ("Approved".equals(us.getStatus())) {
                md.append("- **As a** ").append(us.getRole())
                  .append(" **I want to** ").append(us.getAction())
                  .append(" **So that** ").append(us.getBenefit()).append("\n");
                if (us.getAcceptanceCriteria() != null && !us.getAcceptanceCriteria().isEmpty()) {
                    md.append("  - *Acceptance Criteria:*\n");
                    for (String ac : us.getAcceptanceCriteria()) {
                        md.append("    - ").append(ac).append("\n");
                    }
                }
            }
        }
        
        ExportedFile file = ExportedFile.builder()
                .project(project)
                .fileName(project.getName().replaceAll("\\s+", "_") + "_Requirements.md")
                .fileFormat("MARKDOWN")
                .fileUrl("virtual-download")
                .build();
        exportedFileRepository.save(file);
        
        return org.springframework.http.ResponseEntity.ok()
                .header("Content-Type", "text/markdown; charset=UTF-8")
                .body(md.toString());
    }
}
        }
        
        ExportedFile file = ExportedFile.builder()
                .project(project)
                .fileName(project.getName().replaceAll("\\s+", "_") + "_Requirements.md")
                .fileFormat("MARKDOWN")
                .fileUrl("virtual-download")
                .build();
        exportedFileRepository.save(file);
        
        return org.springframework.http.ResponseEntity.ok()
                .header("Content-Type", "text/markdown; charset=UTF-8")
                .body(md.toString());
    }
}
