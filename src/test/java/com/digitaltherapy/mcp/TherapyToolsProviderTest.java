package com.digitaltherapy.mcp;

import com.digitaltherapy.dto.*;
import com.digitaltherapy.dto.DiaryEntryCreate.EmotionRatingDto;
import com.digitaltherapy.service.AiService;
import com.digitaltherapy.service.CrisisService;
import com.digitaltherapy.service.DiaryService;
import com.digitaltherapy.service.ProgressService;
import com.digitaltherapy.service.SessionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("TherapyToolsProvider Unit Tests")
class TherapyToolsProviderTest {

    @Mock SessionService sessionService;
    @Mock DiaryService diaryService;
    @Mock AiService aiService;
    @Mock CrisisService crisisService;
    @Mock ProgressService progressService;

    @InjectMocks
    TherapyToolsProvider provider;

    private static final String USER_ID   = "d4be73ba-86cf-4cb2-b2e8-4203c77cf880";
    private static final String SESSION_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
    private static final String ENTRY_ID   = "b2c3d4e5-f6a7-8901-bcde-f12345678901";

    // ── Session Tools ─────────────────────────────────────────────────────────

    @Nested
    @DisplayName("start_session")
    class StartSession {

        @Test
        @DisplayName("delegates to sessionService and returns ActiveSession")
        void success() {
            ActiveSession expected = mock(ActiveSession.class);
            when(sessionService.startSession(UUID.fromString(USER_ID), UUID.fromString(SESSION_ID)))
                    .thenReturn(expected);

            ActiveSession result = provider.startSession(USER_ID, SESSION_ID);

            assertThat(result).isEqualTo(expected);
            verify(sessionService).startSession(UUID.fromString(USER_ID), UUID.fromString(SESSION_ID));
        }

        @Test
        @DisplayName("throws IllegalArgumentException for invalid UUID")
        void invalidUuid() {
            assertThatThrownBy(() -> provider.startSession("not-a-uuid", SESSION_ID))
                    .isInstanceOf(IllegalArgumentException.class);
        }

        @Test
        @DisplayName("propagates service exception")
        void serviceThrows() {
            when(sessionService.startSession(any(), any()))
                    .thenThrow(new RuntimeException("session not found"));

            assertThatThrownBy(() -> provider.startSession(USER_ID, SESSION_ID))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("session not found");
        }
    }

    @Nested
    @DisplayName("chat_in_session")
    class ChatInSession {

        @Test
        @DisplayName("delegates to sessionService and returns ChatResponse")
        void success() {
            ChatResponse expected = mock(ChatResponse.class);
            when(sessionService.chat(UUID.fromString(SESSION_ID), "Hello"))
                    .thenReturn(expected);

            ChatResponse result = provider.chatInSession(SESSION_ID, "Hello");

            assertThat(result).isEqualTo(expected);
            verify(sessionService).chat(UUID.fromString(SESSION_ID), "Hello");
        }

        @Test
        @DisplayName("passes message text unchanged to service")
        void passesMessageUnchanged() {
            String message = "I feel anxious about my presentation";
            when(sessionService.chat(any(), eq(message))).thenReturn(mock(ChatResponse.class));

            provider.chatInSession(SESSION_ID, message);

            verify(sessionService).chat(UUID.fromString(SESSION_ID), message);
        }

        @Test
        @DisplayName("throws IllegalArgumentException for invalid session UUID")
        void invalidUuid() {
            assertThatThrownBy(() -> provider.chatInSession("bad-uuid", "Hello"))
                    .isInstanceOf(IllegalArgumentException.class);
        }
    }

    @Nested
    @DisplayName("end_session")
    class EndSession {

        @Test
        @DisplayName("delegates to sessionService and returns SessionSummary")
        void success() {
            SessionSummary expected = mock(SessionSummary.class);
            when(sessionService.endSession(UUID.fromString(SESSION_ID), "completed"))
                    .thenReturn(expected);

            SessionSummary result = provider.endSession(SESSION_ID, "completed");

            assertThat(result).isEqualTo(expected);
            verify(sessionService).endSession(UUID.fromString(SESSION_ID), "completed");
        }

        @Test
        @DisplayName("passes reason unchanged to service")
        void passesReasonUnchanged() {
            String reason = "user requested early termination";
            when(sessionService.endSession(any(), eq(reason))).thenReturn(mock(SessionSummary.class));

            provider.endSession(SESSION_ID, reason);

            verify(sessionService).endSession(UUID.fromString(SESSION_ID), reason);
        }
    }

    @Nested
    @DisplayName("get_session_library")
    class GetSessionLibrary {

        @Test
        @DisplayName("returns list of session modules for user")
        void success() {
            List<SessionModuleDto> expected = List.of(mock(SessionModuleDto.class), mock(SessionModuleDto.class));
            when(sessionService.getSessionLibrary(UUID.fromString(USER_ID))).thenReturn(expected);

            List<SessionModuleDto> result = provider.getSessionLibrary(USER_ID);

            assertThat(result).hasSize(2).isEqualTo(expected);
            verify(sessionService).getSessionLibrary(UUID.fromString(USER_ID));
        }

        @Test
        @DisplayName("returns empty list when no modules available")
        void emptyLibrary() {
            when(sessionService.getSessionLibrary(any())).thenReturn(List.of());

            List<SessionModuleDto> result = provider.getSessionLibrary(USER_ID);

            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("get_session_history")
    class GetSessionHistory {

        @Test
        @DisplayName("returns list of past sessions for user")
        void success() {
            List<SessionHistoryEntry> expected = List.of(mock(SessionHistoryEntry.class));
            when(sessionService.getSessionHistory(UUID.fromString(USER_ID))).thenReturn(expected);

            List<SessionHistoryEntry> result = provider.getSessionHistory(USER_ID);

            assertThat(result).hasSize(1).isEqualTo(expected);
            verify(sessionService).getSessionHistory(UUID.fromString(USER_ID));
        }

        @Test
        @DisplayName("returns empty list for new user with no history")
        void noHistory() {
            when(sessionService.getSessionHistory(any())).thenReturn(List.of());

            List<SessionHistoryEntry> result = provider.getSessionHistory(USER_ID);

            assertThat(result).isEmpty();
        }
    }

    // ── Diary Tools ───────────────────────────────────────────────────────────

    @Nested
    @DisplayName("create_diary_entry")
    class CreateDiaryEntry {

        @Test
        @DisplayName("parses single emotion and delegates to diaryService")
        void singleEmotion() {
            DiaryEntryResponse expected = mock(DiaryEntryResponse.class);
            when(diaryService.createEntry(eq(UUID.fromString(USER_ID)), any(DiaryEntryCreate.class)))
                    .thenReturn(expected);

            DiaryEntryResponse result = provider.createDiaryEntry(
                    USER_ID, "Work meeting", "I always fail", "anxiety:8");

            assertThat(result).isEqualTo(expected);
            verify(diaryService).createEntry(eq(UUID.fromString(USER_ID)), argThat(req ->
                    req.getSituation().equals("Work meeting") &&
                    req.getAutomaticThought().equals("I always fail") &&
                    req.getEmotions().size() == 1 &&
                    req.getEmotions().get(0).getEmotion().equals("anxiety") &&
                    req.getEmotions().get(0).getIntensity() == 8
            ));
        }

        @Test
        @DisplayName("parses multiple emotions correctly")
        void multipleEmotions() {
            when(diaryService.createEntry(any(), any())).thenReturn(mock(DiaryEntryResponse.class));

            provider.createDiaryEntry(USER_ID, "Situation", "Thought", "anxiety:8,sadness:5,guilt:3");

            verify(diaryService).createEntry(eq(UUID.fromString(USER_ID)), argThat(req ->
                    req.getEmotions().size() == 3 &&
                    req.getEmotions().get(0).getEmotion().equals("anxiety") &&
                    req.getEmotions().get(0).getIntensity() == 8 &&
                    req.getEmotions().get(1).getEmotion().equals("sadness") &&
                    req.getEmotions().get(1).getIntensity() == 5 &&
                    req.getEmotions().get(2).getEmotion().equals("guilt") &&
                    req.getEmotions().get(2).getIntensity() == 3
            ));
        }

        @Test
        @DisplayName("defaults intensity to 5 when not specified")
        void defaultIntensity() {
            when(diaryService.createEntry(any(), any())).thenReturn(mock(DiaryEntryResponse.class));

            provider.createDiaryEntry(USER_ID, "Situation", "Thought", "anxiety");

            verify(diaryService).createEntry(eq(UUID.fromString(USER_ID)), argThat(req ->
                    req.getEmotions().get(0).getIntensity() == 5
            ));
        }

        @Test
        @DisplayName("trims whitespace from emotion pairs")
        void trimsWhitespace() {
            when(diaryService.createEntry(any(), any())).thenReturn(mock(DiaryEntryResponse.class));

            provider.createDiaryEntry(USER_ID, "Situation", "Thought", " anxiety : 7 , sadness : 4 ");

            verify(diaryService).createEntry(eq(UUID.fromString(USER_ID)), argThat(req ->
                    req.getEmotions().get(0).getEmotion().equals("anxiety") &&
                    req.getEmotions().get(0).getIntensity() == 7
            ));
        }

        @Test
        @DisplayName("throws IllegalArgumentException for invalid user UUID")
        void invalidUuid() {
            assertThatThrownBy(() -> provider.createDiaryEntry(
                    "not-a-uuid", "Situation", "Thought", "anxiety:5"))
                    .isInstanceOf(IllegalArgumentException.class);
        }
    }

    // ── AI Tools ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("analyze_thought")
    class AnalyzeThought {

        @Test
        @DisplayName("delegates to aiService and returns distortion suggestions")
        void success() {
            List<DistortionSuggestion> expected = List.of(
                    mock(DistortionSuggestion.class),
                    mock(DistortionSuggestion.class)
            );
            when(aiService.analyzeThought("I always fail")).thenReturn(expected);

            List<DistortionSuggestion> result = provider.analyzeThought("I always fail");

            assertThat(result).hasSize(2).isEqualTo(expected);
            verify(aiService).analyzeThought("I always fail");
        }

        @Test
        @DisplayName("returns empty list when no distortions detected")
        void noDistortions() {
            when(aiService.analyzeThought(any())).thenReturn(List.of());

            List<DistortionSuggestion> result = provider.analyzeThought("Today was okay");

            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("passes thought text unchanged to aiService")
        void passesThoughtUnchanged() {
            String thought = "Nobody ever listens to me and I always mess everything up";
            when(aiService.analyzeThought(thought)).thenReturn(List.of());

            provider.analyzeThought(thought);

            verify(aiService).analyzeThought(thought);
            verifyNoMoreInteractions(aiService);
        }
    }

    @Nested
    @DisplayName("suggest_reframing")
    class SuggestReframing {

        @Test
        @DisplayName("delegates to aiService and returns reframing prompts")
        void success() {
            List<String> expected = List.of("Consider that one mistake doesn't define you",
                                            "What evidence supports this thought?");
            when(aiService.generateReframingPrompts(eq("I always fail"), anyList()))
                    .thenReturn(expected);

            List<String> result = provider.suggestReframing("I always fail", "catastrophizing,overgeneralization");

            assertThat(result).hasSize(2).isEqualTo(expected);
            verify(aiService).generateReframingPrompts(eq("I always fail"),
                    argThat(ids -> ids.contains("catastrophizing") && ids.contains("overgeneralization")));
        }

        @Test
        @DisplayName("splits comma-separated distortion IDs correctly")
        void splitsDistortionIds() {
            when(aiService.generateReframingPrompts(any(), anyList())).thenReturn(List.of());

            provider.suggestReframing("Thought", "id1,id2,id3");

            verify(aiService).generateReframingPrompts(eq("Thought"),
                    argThat(ids -> ids.size() == 3 && ids.contains("id1")
                                   && ids.contains("id2") && ids.contains("id3")));
        }

        @Test
        @DisplayName("handles single distortion ID")
        void singleDistortionId() {
            when(aiService.generateReframingPrompts(any(), anyList())).thenReturn(List.of());

            provider.suggestReframing("Thought", "catastrophizing");

            verify(aiService).generateReframingPrompts(eq("Thought"),
                    argThat(ids -> ids.size() == 1 && ids.get(0).equals("catastrophizing")));
        }
    }

    @Nested
    @DisplayName("detect_crisis")
    class DetectCrisis {

        @Test
        @DisplayName("delegates to aiService and returns crisis detection result")
        void success() {
            CrisisDetectionResultDto expected = mock(CrisisDetectionResultDto.class);
            when(aiService.detectCrisis("I feel overwhelmed")).thenReturn(expected);

            CrisisDetectionResultDto result = provider.detectCrisis("I feel overwhelmed");

            assertThat(result).isEqualTo(expected);
            verify(aiService).detectCrisis("I feel overwhelmed");
        }

        @Test
        @DisplayName("passes text unchanged to aiService")
        void passesTextUnchanged() {
            String text = "Everything feels hopeless and I don't know what to do";
            when(aiService.detectCrisis(text)).thenReturn(mock(CrisisDetectionResultDto.class));

            provider.detectCrisis(text);

            verify(aiService).detectCrisis(text);
            verifyNoMoreInteractions(aiService);
        }

        @Test
        @DisplayName("propagates service exception")
        void serviceThrows() {
            when(aiService.detectCrisis(any())).thenThrow(new RuntimeException("AI service unavailable"));

            assertThatThrownBy(() -> provider.detectCrisis("some text"))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("AI service unavailable");
        }
    }

    // ── Crisis & Progress Tools ───────────────────────────────────────────────

    @Nested
    @DisplayName("get_coping_strategies")
    class GetCopingStrategies {

        @Test
        @DisplayName("delegates to crisisService and returns strategies")
        void success() {
            List<CopingStrategy> expected = List.of(
                    mock(CopingStrategy.class),
                    mock(CopingStrategy.class),
                    mock(CopingStrategy.class)
            );
            when(crisisService.getCopingStrategies()).thenReturn(expected);

            List<CopingStrategy> result = provider.getCopingStrategies();

            assertThat(result).hasSize(3).isEqualTo(expected);
            verify(crisisService).getCopingStrategies();
        }

        @Test
        @DisplayName("returns empty list when no strategies configured")
        void noStrategies() {
            when(crisisService.getCopingStrategies()).thenReturn(List.of());

            List<CopingStrategy> result = provider.getCopingStrategies();

            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("does not interact with any other service")
        void noOtherServiceInteractions() {
            when(crisisService.getCopingStrategies()).thenReturn(List.of());

            provider.getCopingStrategies();

            verifyNoInteractions(sessionService, diaryService, aiService, progressService);
        }
    }

    @Nested
    @DisplayName("get_weekly_progress")
    class GetWeeklyProgress {

        @Test
        @DisplayName("delegates to progressService and returns weekly progress")
        void success() {
            WeeklyProgress expected = mock(WeeklyProgress.class);
            when(progressService.getWeeklyProgress(UUID.fromString(USER_ID))).thenReturn(expected);

            WeeklyProgress result = provider.getWeeklyProgress(USER_ID);

            assertThat(result).isEqualTo(expected);
            verify(progressService).getWeeklyProgress(UUID.fromString(USER_ID));
        }

        @Test
        @DisplayName("throws IllegalArgumentException for invalid user UUID")
        void invalidUuid() {
            assertThatThrownBy(() -> provider.getWeeklyProgress("not-a-uuid"))
                    .isInstanceOf(IllegalArgumentException.class);
        }

        @Test
        @DisplayName("does not interact with any other service")
        void noOtherServiceInteractions() {
            when(progressService.getWeeklyProgress(any())).thenReturn(mock(WeeklyProgress.class));

            provider.getWeeklyProgress(USER_ID);

            verifyNoInteractions(sessionService, diaryService, aiService, crisisService);
        }
    }

    @Nested
    @DisplayName("get_insights")
    class GetInsights {

        @Test
        @DisplayName("delegates to diaryService and returns insights")
        void success() {
            DiaryInsights expected = mock(DiaryInsights.class);
            when(diaryService.getInsights(UUID.fromString(USER_ID))).thenReturn(expected);

            DiaryInsights result = provider.getInsights(USER_ID);

            assertThat(result).isEqualTo(expected);
            verify(diaryService).getInsights(UUID.fromString(USER_ID));
        }

        @Test
        @DisplayName("throws IllegalArgumentException for invalid user UUID")
        void invalidUuid() {
            assertThatThrownBy(() -> provider.getInsights("not-a-uuid"))
                    .isInstanceOf(IllegalArgumentException.class);
        }

        @Test
        @DisplayName("does not interact with any other service")
        void noOtherServiceInteractions() {
            when(diaryService.getInsights(any())).thenReturn(mock(DiaryInsights.class));

            provider.getInsights(USER_ID);

            verifyNoInteractions(sessionService, aiService, crisisService, progressService);
        }
    }
}