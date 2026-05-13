package com.digitaltherapy.mcp;

import com.digitaltherapy.dto.*;
import com.digitaltherapy.service.AiService;
import com.digitaltherapy.service.CrisisService;
import com.digitaltherapy.service.DiaryService;
import com.digitaltherapy.service.ProgressService;
import com.digitaltherapy.service.SessionService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.modelcontextprotocol.spec.McpSchema.ReadResourceResult;
import io.modelcontextprotocol.spec.McpSchema.TextResourceContents;
import org.springaicommunity.mcp.annotation.McpResource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
public class TherapyResourceProvider {

    private final SessionService sessionService;
    private final DiaryService diaryService;
    private final CrisisService crisisService;
    private final ProgressService progressService;
    private final AiService aiService;
    private final ObjectMapper objectMapper;

    @Autowired
    public TherapyResourceProvider(SessionService sessionService,
                                   DiaryService diaryService,
                                   CrisisService crisisService,
                                   ProgressService progressService,
                                   AiService aiService,
                                   ObjectMapper objectMapper) {
        this.sessionService = sessionService;
        this.diaryService = diaryService;
        this.crisisService = crisisService;
        this.progressService = progressService;
        this.aiService = aiService;
        this.objectMapper = objectMapper;
    }

    @McpResource(uri = "therapy://sessions/{sessionId}",
                 name = "Session Details",
                 description = "Full details of a CBT session by its ID including title, " +
                               "description, objectives, modalities, and duration.")
    public ReadResourceResult getSession(String sessionId) {
        SessionDetail detail = sessionService.getSessionDetails(UUID.fromString(sessionId));
        return toResult("therapy://sessions/" + sessionId, detail);
    }

    @McpResource(uri = "therapy://diary/{userId}",
                 name = "User Diary Entries",
                 description = "All thought diary entry summaries for a user including " +
                               "situation, automatic thought, mood scores, and distortion count.")
    public ReadResourceResult getDiaryEntries(String userId) {
        List<DiaryEntrySummary> entries = diaryService
                .getEntries(UUID.fromString(userId), Pageable.unpaged())
                .getContent();
        return toResult("therapy://diary/" + userId, entries);
    }

    @McpResource(uri = "therapy://diary/entry/{entryId}",
                 name = "Diary Entry Detail",
                 description = "Full detail of a single thought diary entry including emotions, " +
                               "distortions identified, alternative thought, and mood ratings.")
    public ReadResourceResult getDiaryEntry(String entryId) {
        DiaryEntryDetail detail = diaryService.getEntryDetail(UUID.fromString(entryId));
        return toResult("therapy://diary/entry/" + entryId, detail);
    }

    @McpResource(uri = "therapy://progress/{userId}",
                 name = "User Progress Overview",
                 description = "Weekly progress overview for a user including sessions completed, " +
                               "diary entries, average mood, streak days, and daily mood breakdown.")
    public ReadResourceResult getProgress(String userId) {
        WeeklyProgress progress = progressService.getWeeklyProgress(UUID.fromString(userId));
        return toResult("therapy://progress/" + userId, progress);
    }

    @McpResource(uri = "therapy://crisis/resources",
                 name = "Crisis Resources",
                 description = "Emergency resources and contacts including hotlines, " +
                               "crisis services, and 24/7 availability information.")
    public ReadResourceResult getCrisisResources() {
        CrisisHub hub = crisisService.getCrisisHub(null);
        return toResult("therapy://crisis/resources", hub);
    }

    @McpResource(uri = "therapy://safetyplan/{userId}",
                 name = "User Safety Plan",
                 description = "A user's personal safety plan including warning signals, " +
                               "coping strategies, trusted contacts, and reason for living.")
    public ReadResourceResult getSafetyPlan(String userId) {
        SafetyPlanDto plan = crisisService.getSafetyPlan(UUID.fromString(userId));
        return toResult("therapy://safetyplan/" + userId, plan);
    }

    @McpResource(uri = "therapy://distortions",
                 name = "Cognitive Distortion Definitions",
                 description = "All supported cognitive distortion types with names and descriptions " +
                               "used across the therapy assistant for analysis and reframing.")
    public ReadResourceResult getDistortions() {
        List<DistortionSuggestion> distortions =
                aiService.analyzeThought("enumerate all cognitive distortions");
        return toResult("therapy://distortions", distortions);
    }

    // ── helper ────────────────────────────────────────────────────────────────

    private ReadResourceResult toResult(String uri, Object payload) {
        try {
            String json = objectMapper.writeValueAsString(payload);
            return new ReadResourceResult(
                List.of(new TextResourceContents(uri, "application/json", json))
            );
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to serialize MCP resource: " + uri, e);
        }
    }
}