package com.digitaltherapy.mcp;

import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.ai.tool.method.MethodToolCallbackProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.context.annotation.Primary;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

@Configuration
public class McpServerConfig {

    /**
     * MCP Server configuration for the Digital Therapy Assistant.
     *
     * Transport and capability settings are driven by application.properties:
     *
     *   spring.ai.mcp.server.stdio=true
     *   spring.ai.mcp.server.name=digital-therapy-assistant
     *   spring.ai.mcp.server.version=1.0.0
     *   spring.ai.mcp.server.type=SYNC
     *   spring.ai.mcp.server.capabilities.tool=true
     *   spring.ai.mcp.server.capabilities.resource=true
     *   spring.ai.mcp.server.capabilities.prompt=true
     *   spring.ai.mcp.server.annotation-scanner.enabled=true
     *
     * TherapyToolsProvider, TherapyResourceProvider, and TherapyPromptProvider
     * are picked up automatically by the annotation scanner as @Component beans.
     * No manual registration is required.
     *
     * To connect Claude Desktop, add the following to claude_desktop_config.json:
     *
     *   {
     *     "mcpServers": {
     *       "digital-therapy-assistant": {
     *         "command": "java",
     *         "args": [
     *           "-jar",
     *           "/path/to/digitaltherapy.jar",
     *           "--spring.profiles.active=mcp",
     *           "--spring.main.web-application-type=none"
     *         ]
     *       }
     *     }
     *   }
     */
    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        
        return new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    @Bean
    public ToolCallbackProvider therapyTools(@Lazy TherapyToolsProvider provider) {
        return MethodToolCallbackProvider.builder()
                .toolObjects(provider)
                .build();
    }
}