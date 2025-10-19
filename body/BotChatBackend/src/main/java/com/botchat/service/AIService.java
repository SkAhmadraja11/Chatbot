package com.botchat.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class AIService {

    private static final String API_KEY = "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";
    private static final String API_URL = "https://openrouter.ai/api/v1/chat/completions";

    public String getAnswer(String userMessage) {
        if (userMessage == null || userMessage.trim().isEmpty()) {
            return "Please enter a valid message.";
        }

        try {
            HttpClient client = HttpClient.newHttpClient();
            ObjectMapper mapper = new ObjectMapper();

            // Build JSON payload safely
            ObjectNode payload = mapper.createObjectNode();
            payload.put("model", "alibaba/tongyi-deepresearch-30b-a3b:free");

            ArrayNode messages = mapper.createArrayNode();
            ObjectNode systemMsg = mapper.createObjectNode();
            systemMsg.put("role", "system");
            systemMsg.put("content", "You are a helpful AI assistant.");
            messages.add(systemMsg);

            ObjectNode userMsg = mapper.createObjectNode();
            userMsg.put("role", "user");
            userMsg.put("content", userMessage);
            messages.add(userMsg);

            payload.set("messages", messages);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(API_URL))
                    .header("Authorization", "Bearer " + API_KEY)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(payload.toString()))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            System.out.println("🧾 AI Response: " + response.body());

            JsonNode root = mapper.readTree(response.body());

            if (root.has("error")) {
                return "⚠️ AI API Error: " + root.get("error").path("message").asText("Unknown error");
            }

            JsonNode choices = root.path("choices");
            if (choices.isArray() && choices.size() > 0) {
                JsonNode messageNode = choices.get(0).path("message");
                return messageNode.path("content").asText("⚠️ Empty response from AI.").trim();
            }

            return "⚠️ Sorry, I couldn’t get a valid reply from AI.";

        } catch (Exception e) {
            e.printStackTrace();
            return "⚠️ Oops! Something went wrong while connecting to AI service.";
        }
    }
}
