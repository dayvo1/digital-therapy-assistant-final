package com.digitaltherapy.mcp;

import io.modelcontextprotocol.spec.McpSchema.GetPromptResult;
import io.modelcontextprotocol.spec.McpSchema.PromptMessage;
import io.modelcontextprotocol.spec.McpSchema.Role;
import io.modelcontextprotocol.spec.McpSchema.TextContent;
import org.springaicommunity.mcp.annotation.McpPrompt;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class TherapyPromptProvider {

    @McpPrompt(name = "thought_analysis",
               description = "Structured prompt for analyzing an automatic thought for cognitive distortions. " +
                             "Guides the AI to identify distortion types, explain why they apply, " +
                             "and score confidence for each.")
    public GetPromptResult thoughtAnalysis(String thought) {
        String text = """
                You are a CBT-trained therapy assistant. Analyze the following automatic thought for cognitive distortions.

                Automatic Thought: "%s"

                For each cognitive distortion you identify:
                1. Name the distortion (e.g. catastrophizing, black-and-white thinking, mind reading, overgeneralization, personalization, emotional reasoning, should statements, labeling, magnification/minimization, jumping to conclusions)
                2. Explain specifically why this thought exhibits that distortion
                3. Provide a confidence score from 0.0 to 1.0

                Then suggest one compassionate reframing of the thought that a CBT therapist might offer.
                """.formatted(thought);

        return toPromptResult("Thought Analysis: Cognitive Distortion Review", text);
    }

    @McpPrompt(name = "session_summary",
               description = "Prompt for generating a structured therapeutic session summary " +
                             "covering key insights, progress made, and recommended follow-up.")
    public GetPromptResult sessionSummary(String sessionId) {
        String text = """
                You are a CBT-trained therapy assistant. Generate a structured summary for session ID: %s

                The summary should cover:
                1. Main themes and topics explored during the session
                2. Cognitive distortions identified and worked through
                3. Coping strategies introduced or practiced
                4. Mood change from start to end of session (if available)
                5. Key insights the user appeared to gain
                6. Recommended focus areas for the next session

                Keep the tone warm, professional, and encouraging.
                """.formatted(sessionId);

        return toPromptResult("Session Summary", text);
    }

    @McpPrompt(name = "weekly_check_in",
               description = "Guided weekly check-in template with mood and progress questions " +
                             "to help the user reflect on their therapeutic journey over the past week.")
    public GetPromptResult weeklyCheckIn(String userId) {
        String text = """
                You are a compassionate CBT-trained therapy assistant conducting a weekly check-in for user ID: %s

                Guide the user through the following reflection questions one at a time:
                1. On a scale of 1-10, how would you rate your overall mood this week compared to last week?
                2. What was the most challenging situation you faced this week, and how did you respond to it?
                3. Did you notice any recurring automatic thoughts or thinking patterns this week?
                4. Which coping strategies did you use, and how effective were they?
                5. What progress, however small, are you proud of from this week?
                6. What would you like to focus on or work toward in the coming week?

                After the user responds to each question, acknowledge their answer with empathy before moving to the next.
                End the check-in with a brief encouraging summary of their progress.
                """.formatted(userId);

        return toPromptResult("Weekly Check-In", text);
    }

    // ── helper ────────────────────────────────────────────────────────────────

    private GetPromptResult toPromptResult(String description, String text) {
        PromptMessage message = new PromptMessage(
            Role.USER,
            new TextContent(text)
        );
        return new GetPromptResult(description, List.of(message));
    }
}