package com.example.backend.controller;

import com.example.backend.ai.GeminiClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/requirements")
public class RequirementController {

    @Autowired
    private GeminiClient geminiClient;

    @GetMapping("/test-ai")
    public String testAi(@RequestParam(defaultValue = "Hello Gemini, can you give me a short summary of requirement analysis?") String prompt) {
        return geminiClient.testGeminiApi(prompt);
    }
}
