package com.botchat.controller;

import com.botchat.model.Message;
import com.botchat.repository.MessageRepository;
import com.botchat.service.AIService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/")
@CrossOrigin(origins = "http://localhost:5173")  // Allow your React frontend
public class ChatController {

    private final MessageRepository repository;
    private final AIService aiService;

    public ChatController(MessageRepository repository, AIService aiService) {
        this.repository = repository;
        this.aiService = aiService;
    }

    // --- WebSocket endpoint ---
    @MessageMapping("/sendMessage")
    @SendTo("/topic/public")
    public Message sendWebSocketMessage(Message message) {
        message.setTimestamp(LocalDateTime.now());
        repository.save(message);
        return message;
    }

    // --- REST endpoint for AI bot replies ---
    @PostMapping("/api/message")
    public ResponseEntity<Map<String, String>> sendAIMessage(@RequestBody Map<String, String> payload) {
        String userMessage = payload.get("userMessage");
        if (userMessage == null || userMessage.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("botMessage", "Please enter a valid message."));
        }

        // Default bot message if AI service fails
        String botMessage = "⚠️ Sorry, I couldn't process your request at the moment.";

        try {
            // Call AIService safely
            String aiReply = aiService.getAnswer(userMessage);
            if (aiReply != null && !aiReply.trim().isEmpty()) {
                botMessage = aiReply;
            }
        } catch (Exception e) {
            e.printStackTrace(); // Logs the real error
        }

        // Save user message to DB
        try {
            Message userMsg = new Message();
            userMsg.setContent(userMessage);
            userMsg.setSender("User");
            userMsg.setTimestamp(LocalDateTime.now());
            repository.save(userMsg);
        } catch (Exception e) {
            e.printStackTrace();
        }

        // Save bot message to DB
        try {
            Message botMsg = new Message();
            botMsg.setContent(botMessage);
            botMsg.setSender("Bot");
            botMsg.setTimestamp(LocalDateTime.now());
            repository.save(botMsg);
        } catch (Exception e) {
            e.printStackTrace();
        }

        // Return response to frontend
        Map<String, String> response = new HashMap<>();
        response.put("botMessage", botMessage);
        return ResponseEntity.ok(response);
    }
}
