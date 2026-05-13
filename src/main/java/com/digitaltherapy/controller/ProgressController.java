package com.digitaltherapy.controller;

import com.digitaltherapy.dto.*;
import com.digitaltherapy.entity.User;
import com.digitaltherapy.service.ProgressService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
@Tag(name = "Progress", description = "User progress tracking endpoints")
public class ProgressController {

    private final ProgressService progressService;

    @GetMapping("/weekly")
    @Operation(summary = "Get weekly progress report")
    public ResponseEntity<WeeklyProgress> getWeeklyProgress(@AuthenticationPrincipal User user) {
        log.info("Fetching weekly progress for user: {}", user.getId());
        return ResponseEntity.ok(progressService.getWeeklyProgress(user.getId()));
    }

    @GetMapping("/monthly")
    @Operation(summary = "Get monthly trend data")
    public ResponseEntity<MonthlyTrend> getMonthlyTrend(@AuthenticationPrincipal User user) {
        log.info("Fetching monthly trend for user: {}", user.getId());
        return ResponseEntity.ok(progressService.getMonthlyTrend(user.getId()));
    }

    @GetMapping("/burnout")
    @Operation(summary = "Get burnout recovery status")
    public ResponseEntity<BurnoutRecovery> getBurnoutRecovery(@AuthenticationPrincipal User user) {
        log.info("Fetching burnout recovery for user: {}", user.getId());
        return ResponseEntity.ok(progressService.getBurnoutRecovery(user.getId()));
    }

    @GetMapping("/achievements")
    @Operation(summary = "Get user achievements")
    public ResponseEntity<List<Achievement>> getAchievements(@AuthenticationPrincipal User user) {
        log.info("Fetching achievements for user: {}", user.getId());
        return ResponseEntity.ok(progressService.getAchievements(user.getId()));
    }
}
