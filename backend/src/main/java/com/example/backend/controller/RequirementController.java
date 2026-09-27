package com.example.backend.controller;

import com.example.backend.ai.GeminiClient;
import com.example.backend.dto.AnalyzeRequest;
import com.example.backend.dto.AnalyzeResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/requirements")
public class RequirementController {

    @Autowired
    private GeminiClient geminiClient;

    @PostMapping("/test-ai")
    public AnalyzeResponse testAi(@RequestBody AnalyzeRequest request) {
        return geminiClient.testGeminiApi(request.body());
    }

}
