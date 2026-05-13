package com.digitaltherapy.mcp;

import com.digitaltherapy.dto.*;
import com.digitaltherapy.dto.DiaryEntryCreate.EmotionRatingDto;
import com.digitaltherapy.service.AiService;
import com.digitaltherapy.service.CrisisService;
import com.digitaltherapy.service.DiaryService;
import com.digitaltherapy.service.ProgressService;
import com.digitaltherapy.service.SessionService;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Component
public class TherapyToolsProvider {

    private final SessionService sessionService;
    private final DiaryService diaryService;
    private final AiService aiService;
    private final CrisisService crisisService;
    private final ProgressService progressService;

    @Autowired
    public TherapyToolsProvider(SessionService sessionService,
                                DiaryService diaryService,
                                AiService aiService,
                                CrisisService crisisService,
                                ProgressService progressService) {
        this.sessionService = sessionService;
        this.diaryService = diaryService;
        this.aiService = aiService;
        this.crisisService = crisisService;
        this.progressService = progressService;
    }

    @Tool(name = "start_session",
          description = "Start a new CBT therapy session for a user. " +
                        "Returns an ActiveSession with session state and metadata.")
    public ActiveSession startSession(String userId, String sessionId) {
        return sessionService.startSession(UUID.fromString(userId), UUID.fromString(sessionId));
    }

    @Tool(name = "chat_in_session",
          description = "Send a message in an active CBT session and receive an AI therapeutic response. " +
                        "The session must already be started via start_session.")
    public ChatResponse chatInSession(String sessionId, String message) {
        return sessionService.chat(UUID.fromString(sessionId), message);
    }

    @Tool(name = "end_session",
          description = "End an active CBT session and receive a therapeutic summary " +
                        "including outcomes and recommended next steps.")
    public SessionSummary endSession(String sessionId, String reason) {
        return sessionService.endSession(UUID.fromString(sessionId), reason);
    }

    @Tool(name = "get_session_library",
          description = "List all available CBT session modules a user can start. " +
                        "Returns module titles, descriptions, and difficulty levels.")
    public List<SessionModuleDto> getSessionLibrary(String userId) {
        return sessionService.getSessionLibrary(UUID.fromString(userId));
    }

    @Tool(name = "get_session_history",
          description = "Retrieve a user's past CBT session history including dates, " +
                        "modules completed, and brief summaries.")
    public List<SessionHistoryEntry> getSessionHistory(String userId) {
        return sessionService.getSessionHistory(UUID.fromString(userId));
    }

    @Tool(name = "create_diary_entry",
    description = "Create a new thought diary entry. Pass emotions as comma-separated " +
                    "name:intensity pairs e.g. 'anxiety:8,sadness:5,guilt:3'. " +
                    "Intensity is 1-10. Returns the entry with AI-suggested cognitive distortions.")
    public DiaryEntryResponse createDiaryEntry(String userId, String situation,
                                            String automaticThought, String emotions) {
        List<EmotionRatingDto> emotionList = Arrays.stream(emotions.split(","))
                .map(String::trim)
                .map(pair -> {
                    String[] parts = pair.split(":");
                    return EmotionRatingDto.builder()
                            .emotion(parts[0].trim())
                            .intensity(parts.length > 1 ? Integer.parseInt(parts[1].trim()) : 5)
                            .build();
                })
                .toList();

        DiaryEntryCreate request = DiaryEntryCreate.builder()
                .situation(situation)
                .automaticThought(automaticThought)
                .emotions(emotionList)
                .build();

        return diaryService.createEntry(UUID.fromString(userId), request);
    }

    @Tool(name = "analyze_thought",
          description = "Analyze an automatic thought for cognitive distortions. " +
                        "Returns a ranked list of distortion types with confidence scores between 0 and 1.")
    public List<DistortionSuggestion> analyzeThought(String thought) {
        return aiService.analyzeThought(thought);
    }

    @Tool(name = "suggest_reframing",
          description = "Generate reframing prompts for an automatic thought based on identified " +
                        "cognitive distortions. Pass distortion IDs as a comma-separated string.")
    public List<String> suggestReframing(String thought, String distortionIds) {
        return aiService.generateReframingPrompts(thought, Arrays.asList(distortionIds.split(",")));
    }

    @Tool(name = "detect_crisis",
          description = "Analyze text for crisis indicators such as suicidal ideation or self-harm risk. " +
                        "Returns a risk level (LOW, MEDIUM, HIGH) and a list of detected indicators.")
    public CrisisDetectionResultDto detectCrisis(String text) {
        return aiService.detectCrisis(text);
    }

    @Tool(name = "get_coping_strategies",
          description = "Retrieve the full list of therapeutic coping strategies available to users. " +
                        "Returns strategy names, descriptions, and categories.")
    public List<CopingStrategy> getCopingStrategies() {
        return crisisService.getCopingStrategies();
    }

    @Tool(name = "get_weekly_progress",
          description = "Get a user's weekly therapy progress summary including mood trends, " +
                        "sessions completed, diary entries made, and burnout indicators.")
    public WeeklyProgress getWeeklyProgress(String userId) {
        return progressService.getWeeklyProgress(UUID.fromString(userId));
    }

    @Tool(name = "get_insights",
          description = "Get AI-generated insights from a user's thought diary entries. " +
                        "Returns recurring patterns, emotional themes, and personalized CBT recommendations.")
    public DiaryInsights getInsights(String userId) {
        return diaryService.getInsights(UUID.fromString(userId));
    }
}
