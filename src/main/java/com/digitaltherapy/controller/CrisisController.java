package com.digitaltherapy.controller;

import com.digitaltherapy.dto.*;
import com.digitaltherapy.service.CrisisService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/crisis")
@RequiredArgsConstructor
@Tag(name = "Crisis Support", description = "Crisis detection and support endpoints")
public class CrisisController {

    private final CrisisService crisisService;

    @GetMapping
    @Operation(summary = "Get crisis support hub")
    public ResponseEntity<CrisisHub> getCrisisHub(
            @RequestParam(required = false) UUID userId) {
        log.info("Fetching crisis hub, userId: {}", userId);
        return ResponseEntity.ok(crisisService.getCrisisHub(userId));
    }

    @GetMapping("/coping-strategies")
    @Operation(summary = "Get available coping strategies")
    public ResponseEntity<List<CopingStrategy>> getCopingStrategies() {
        log.info("Fetching coping strategies");
        return ResponseEntity.ok(crisisService.getCopingStrategies());
    }

    @PostMapping("/detect")
    @Operation(summary = "Detect crisis indicators in text")
    public ResponseEntity<CrisisDetectionResultDto> detectCrisis(
            @Valid @RequestBody CrisisDetectRequest request) {
        log.info("Running crisis detection");
        return ResponseEntity.ok(crisisService.detectCrisis(request.getText()));
    }

    @GetMapping("/safety-plan")
    @Operation(summary = "Get user safety plan")
    public ResponseEntity<SafetyPlanDto> getSafetyPlan(@RequestParam UUID userId) {
        log.info("Fetching safety plan for user: {}", userId);
        return ResponseEntity.ok(crisisService.getSafetyPlan(userId));
    }

    @PutMapping("/safety-plan")
    @Operation(summary = "Update user safety plan")
    public ResponseEntity<SafetyPlanDto> updateSafetyPlan(
            @RequestParam UUID userId,
            @Valid @RequestBody SafetyPlanUpdate request) {
        log.info("Updating safety plan for user: {}", userId);
        return ResponseEntity.ok(crisisService.updateSafetyPlan(userId, request));
    }
}
