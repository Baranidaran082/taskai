import React, { useState, useRef, useEffect } from "react";
import "./AIChatBox.css";
import axios from "axios";

axios.defaults.withCredentials = true;

const QUICK_ACTIONS = [
  "Show today's tasks",
  "Create task",
  "Update deadline",
  "Delete task",
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

function AIChatBox({ tasks, fetchTasks, userEmail, userName, chatMessages, setChatMessages }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = [chatMessages, setChatMessages];
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (text) => {
    const msg = (text || input).trim();
    if (!msg) return;

    const userMessage = { type: "user", text: msg };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setInput("");

    try {
      const res = await axios.post(
`${process.env.REACT_APP_API_URL}/api/ai/agent`,
  { message: msg }
);
      const aiMessage = { type: "ai", text: res.data.reply };
      setMessages((prev) => [...prev, aiMessage]);
      await fetchTasks();
    } catch (error) {
      console.error("AI Chat Error:", error);
      const errorMessage = {
        type: "ai",
        text: "AI server is busy. Please try again in a moment.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm("Clear all conversation history?")) return;
    try {
      await axios.delete(
  `${process.env.REACT_APP_API_URL}/api/ai/history`
);
      setChatMessages([]);
    } catch (error) {
      console.error("Failed to clear history:", error);
    }
  };

  const displayName = userName || (userEmail ? userEmail.split("@")[0] : "there");
  const userInitial = (userName || userEmail || "U")[0].toUpperCase();

  return (
    <div className="ai-page">
      {/* Greeting */}
      <div className="ai-greeting">
        <h1 className="ai-greeting-title">
          {getGreeting()}, {displayName}! 👋
        </h1>
        <p className="ai-greeting-sub">
          Manage your tasks smarter with AI
        </p>
      </div>

      {/* Chat window */}
      <div className="ai-chat-window">

        {/* Chat header with clear button */}
        <div className="ai-chat-header">
          <span className="ai-chat-header-title">Conversation</span>
          {messages.length > 0 && (
            <button
              className="ai-clear-btn"
              onClick={handleClearHistory}
              disabled={loading}
            >
              Clear history
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="ai-messages">
          {messages.length === 0 && (
            <div className="ai-empty">
              <div className="ai-empty-avatar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="10" rx="2" />
                  <circle cx="12" cy="5" r="2" />
                  <path d="M12 7v4" />
                  <line x1="8" y1="16" x2="8" y2="16" strokeWidth="3" strokeLinecap="round" />
                  <line x1="12" y1="16" x2="12" y2="16" strokeWidth="3" strokeLinecap="round" />
                  <line x1="16" y1="16" x2="16" y2="16" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
              <p className="ai-empty-title">How can I help you today?</p>
              <p className="ai-empty-sub">
                Ask me to create, update, or delete tasks — or just ask about your workflow.
              </p>
            </div>
          )}

          {messages.map((msg, index) => (
            <div key={index} className={`ai-message-row ${msg.type === "user" ? "ai-message-row--user" : "ai-message-row--ai"}`}>
              {msg.type === "ai" && (
                <div className="ai-avatar">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="10" rx="2" />
                    <circle cx="12" cy="5" r="2" />
                    <path d="M12 7v4" />
                    <line x1="8" y1="16" x2="8" y2="16" strokeWidth="3" strokeLinecap="round" />
                    <line x1="12" y1="16" x2="12" y2="16" strokeWidth="3" strokeLinecap="round" />
                    <line x1="16" y1="16" x2="16" y2="16" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </div>
              )}

              <div className={`ai-bubble ${msg.type === "user" ? "ai-bubble--user" : "ai-bubble--ai"}`}>
                <p className="ai-bubble-text">{msg.text}</p>
              </div>

              {msg.type === "user" && (
                <div className="user-avatar">{userInitial}</div>
              )}
            </div>
          ))}

          {loading && (
            <div className="ai-message-row ai-message-row--ai">
              <div className="ai-avatar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="10" rx="2" />
                  <circle cx="12" cy="5" r="2" />
                  <path d="M12 7v4" />
                </svg>
              </div>
              <div className="ai-bubble ai-bubble--ai ai-bubble--typing">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick actions */}
        <div className="ai-quick-actions">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action}
              className="quick-action-btn"
              onClick={() => handleSend(action)}
              disabled={loading}
            >
              {action}
            </button>
          ))}
        </div>

        {/* Input area */}
        <div className="ai-input-area">
          {/* <button className="ai-input-icon-btn" aria-label="Attach file" disabled>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
          </button> */}

          <input
            type="text"
            className="ai-text-input"
            placeholder="Type your instruction here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && handleSend()}
            disabled={loading}
          />

          {/* <button className="ai-input-icon-btn" aria-label="Voice input" disabled>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </button> */}

          <button
            className="ai-send-btn"
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            aria-label="Send message"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>

        <p className="ai-disclaimer">AI can make mistakes. Check important info.</p>
      </div>
    </div>
  );
}

export default AIChatBox;
