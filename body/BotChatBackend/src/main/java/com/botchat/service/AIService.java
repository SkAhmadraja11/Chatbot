package com.botchat.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class AIService {

    // ✅ Use your valid OpenRouter key
    private static final String API_KEY = "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";
    private static final String API_URL = "https://openrouter.ai/api/v1";

    public String getAnswer(String userMessage) {
        if (userMessage == null || userMessage.trim().isEmpty()) {
            return "Please enter a valid message.";
        }

        try {
            HttpClient client = HttpClient.newHttpClient();

            // Build payload using a working model
            String payload = """
                {
                  "model": "deepseek/deepseek-chat-v3.1:free",
                  "messages": [
                    {"role": "system", "content": "You are a helpful AI assistant."},
                    {"role": "user", "content": "%s"}
                  ]
                }
            """.formatted(userMessage.replace("\"", "'"));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(API_URL))
                    .header("Authorization", "Bearer " + API_KEY)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(payload))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            System.out.println("🧾 AI Response: " + response.body()); // debug

            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response.body());

            // Handle API errors
            if (root.has("error")) {
                JsonNode error = root.get("error");
                return "⚠️ AI API Error: " + error.path("message").asText("Unknown error");
            }

            // Extract AI reply
            JsonNode choices = root.path("choices");
            if (choices.isArray() && choices.size() > 0) {
                JsonNode message = choices.get(0).path("message");
                return message.path("content").asText("⚠️ Empty response from AI.").trim();
            }

            return "⚠️ Sorry, I couldn’t get a valid reply from AI.";

        } catch (Exception e) {
            e.printStackTrace(); // shows exact error in console
            return "⚠️ Oops! Something went wrong while connecting to AI service.";
        }
    }
}
