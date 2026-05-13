package com.digitaltherapy.controller;

import com.digitaltherapy.dto.*;
import com.digitaltherapy.entity.User;
import com.digitaltherapy.service.SessionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
@Tag(name = "Sessions", description = "Therapy session management endpoints")
public class SessionController {

    private final SessionService sessionService;

    @GetMapping
    @Operation(summary = "Get session library")
    public ResponseEntity<List<SessionModuleDto>> getSessionLibrary(@AuthenticationPrincipal User user) {
        log.info("Fetching session library for user: {}", user.getId());
        return ResponseEntity.ok(sessionService.getSessionLibrary(user.getId()));
    }

    @GetMapping("/{sessionId}")
    @Operation(summary = "Get session details")
    public ResponseEntity<SessionDetail> getSessionDetails(@PathVariable UUID sessionId) {
        log.info("Fetching session details for session: {}", sessionId);
        return ResponseEntity.ok(sessionService.getSessionDetails(sessionId));
    }

    @PostMapping("/{sessionId}/start")
    @Operation(summary = "Start a therapy session")
    public ResponseEntity<ActiveSession> startSession(
            @PathVariable UUID sessionId,
            @AuthenticationPrincipal User user,
            @RequestBody(required = false) Map<String, Object> body) {
        log.info("Starting session: {} for user: {}", sessionId, user.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(sessionService.startSession(user.getId(), sessionId));
    }

    @PostMapping("/{sessionId}/chat")
    @Operation(summary = "Send a chat message within a session")
    public ResponseEntity<ChatResponse> chat(
            @PathVariable UUID sessionId,
            @Valid @RequestBody ChatRequest request) {
        log.info("Chat message in session: {}", sessionId);
        return ResponseEntity.ok(sessionService.chat(sessionId, request.getMessage()));
    }

    @PostMapping("/{sessionId}/end")
    @Operation(summary = "End a therapy session")
    public ResponseEntity<SessionSummary> endSession(
            @PathVariable UUID sessionId,
            @RequestBody(required = false) Map<String, Object> body) {
        log.info("Ending session: {}", sessionId);
        String reason = body != null ? (String) body.get("reason") : null;
        return ResponseEntity.ok(sessionService.endSession(sessionId, reason));
    }

    @GetMapping("/history")
    @Operation(summary = "Get session history for the authenticated user")
    public ResponseEntity<List<SessionHistoryEntry>> getSessionHistory(@AuthenticationPrincipal User user) {
        log.info("Fetching session history for user: {}", user.getId());
        return ResponseEntity.ok(sessionService.getSessionHistory(user.getId()));
    }
}
