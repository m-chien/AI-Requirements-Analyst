package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "exported_files")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExportedFile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String fileFormat; // MARKDOWN, DOCX, PDF, JSON

    @Column(nullable = false)
    private String fileUrl; // Path hoặc URL tải file

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
