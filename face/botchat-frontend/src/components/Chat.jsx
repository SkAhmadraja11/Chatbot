import React, { useEffect, useState, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import axios from "axios";
import "./Chat.css"; // Make sure Chat.css is in the same folder

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [stompClient, setStompClient] = useState(null);
  // refs to remember messages we've already added so we can avoid duplicates
  const seenIdsRef = useRef(new Set());
  const seenSigsRef = useRef(new Set());

  // 🔗 Setup WebSocket connection for live chat
  useEffect(() => {
    const socket = new SockJS("http://localhost:7070/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log(str),
      onConnect: () => {
        client.subscribe("/topic/public", (msg) => {
          try {
            const message = JSON.parse(msg.body);

            // If the backend echoes our localId, skip it (we already added locally)
            if (message.localId && seenIdsRef.current.has(message.localId)) return;

            // dedupe by signature (sender + content) as fallback
            const sig = `${message.sender || ""}::${(message.content || "").trim()}`;
            if (seenSigsRef.current.has(sig)) return;

            // mark seen
            if (message.localId) seenIdsRef.current.add(message.localId);
            seenSigsRef.current.add(sig);

            setMessages((prev) => [...prev, message]);
          } catch (e) {
            console.warn("Failed to parse WS message", e);
          }
        });
      },
    });
    client.activate(); 
    setStompClient(client);

    return () => client.deactivate();
  }, []);

  // 💬 Send message (to both WebSocket + AI backend)
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

  // attach a short local id so we can recognize backend echoes
  const localId = `local-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const userMsg = { sender: "User", content: newMessage, localId };
  setMessages((prev) => [...prev, userMsg]);
  // remember this message so an echoed WS message or later broadcast won't duplicate it
  seenIdsRef.current.add(localId);
  seenSigsRef.current.add(`User::${newMessage.trim()}`);
    setNewMessage("");
    setIsTyping(true);

    // Send via WebSocket
    if (stompClient) {
      stompClient.publish({
        destination: "/app/sendMessage",
        body: JSON.stringify(userMsg),
      });
    }

    // Ask AI backend
    try {
      const response = await axios.post("http://localhost:7070/api/message", {
        userMessage: userMsg.content,
      });
      const botContent = response.data.botMessage;

      const botMsg = {
        sender: "Bot",
        content: botContent,
        localId: `bot-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      };

      // dedupe bot reply by signature to avoid duplicate when backend also broadcasts it
      const botSig = `Bot::${(botContent || "").trim()}`;
      if (!seenSigsRef.current.has(botSig)) {
        seenSigsRef.current.add(botSig);
        if (botMsg.localId) seenIdsRef.current.add(botMsg.localId);
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (err) {
      const errMsg = { sender: "Bot", content: "Sorry, I cannot answer right now." };
      const errSig = `Bot::${errMsg.content}`;
      if (!seenSigsRef.current.has(errSig)) {
        seenSigsRef.current.add(errSig);
        setMessages((prev) => [...prev, errMsg]);
      }
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chat-header">🛍️ Note-G Assistant</div>

      <div className="chat-body">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`message ${msg.sender === "User" ? "user" : "bot"}`}
          >
            <div className="bubble">{msg.content}</div>
          </div>
        ))}

        {isTyping && (
          <div className="message bot typing">
            <div className="bubble typing-bubble">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        )}
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Ask Anything..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>➤</button>
      </div>
    </div>
  );
};

export default Chat;
