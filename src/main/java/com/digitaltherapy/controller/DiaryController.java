package com.digitaltherapy.controller;

import com.digitaltherapy.dto.*;
import com.digitaltherapy.entity.User;
import com.digitaltherapy.service.DiaryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/diary")
@RequiredArgsConstructor
@Tag(name = "Diary", description = "Thought diary management endpoints")
public class DiaryController {

    private final DiaryService diaryService;

    @GetMapping("/entries")
    @Operation(summary = "Get diary entries with pagination")
    public ResponseEntity<Page<DiaryEntrySummary>> getEntries(
            @AuthenticationPrincipal User user,
            Pageable pageable) {
        log.info("Fetching diary entries for user: {}", user.getId());
        return ResponseEntity.ok(diaryService.getEntries(user.getId(), pageable));
    }

    @PostMapping("/entries")
    @Operation(summary = "Create a new diary entry")
    public ResponseEntity<DiaryEntryResponse> createEntry(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody DiaryEntryCreate request) {
        log.info("Creating diary entry for user: {}", user.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(diaryService.createEntry(user.getId(), request));
    }

    @GetMapping("/entries/{entryId}")
    @Operation(summary = "Get diary entry detail")
    public ResponseEntity<DiaryEntryDetail> getEntryDetail(@PathVariable UUID entryId) {
        log.info("Fetching diary entry detail: {}", entryId);
        return ResponseEntity.ok(diaryService.getEntryDetail(entryId));
    }

    @DeleteMapping("/entries/{entryId}")
    @Operation(summary = "Delete a diary entry")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> deleteEntry(@PathVariable UUID entryId) {
        log.info("Deleting diary entry: {}", entryId);
        diaryService.deleteEntry(entryId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/distortions/suggest")
    @Operation(summary = "Suggest cognitive distortions for a thought")
    public ResponseEntity<List<DistortionSuggestion>> suggestDistortions(
            @RequestBody Map<String, String> body) {
        String thought = body.get("thought");
        log.info("Suggesting distortions for thought input");
        return ResponseEntity.ok(diaryService.suggestDistortions(thought));
    }

    @GetMapping("/insights")
    @Operation(summary = "Get diary insights for the authenticated user")
    public ResponseEntity<DiaryInsights> getInsights(@AuthenticationPrincipal User user) {
        log.info("Fetching diary insights for user: {}", user.getId());
        return ResponseEntity.ok(diaryService.getInsights(user.getId()));
    }
}
