package com.example.chien_java_template.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaginationDTO {
    private int pageNumber;
    private int pageSize;
    private String sortBy;
    private String sortDirection;
}

