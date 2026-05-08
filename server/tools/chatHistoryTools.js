import ChatHistory from "../models/ChatHistory.js";

// Max messages to send to Gemini to avoid token overflow
const MAX_HISTORY_LENGTH = 20;

/**
 * Get chat history for a user from MongoDB
 * Returns messages formatted for Gemini's generateContent API
 */
export const getChatHistory = async (userId) => {
  let chat = await ChatHistory.findOne({ userId });

  if (!chat) {
    return [];
  }

  // Limit to last N messages to avoid token overflow
  const recentMessages = chat.messages.slice(-MAX_HISTORY_LENGTH);

  // Format for Gemini API: { role, parts: [{ text }] }
  return recentMessages.map((msg) => ({
    role: msg.role,
    parts: [{ text: msg.text }]
  }));
};

/**
 * Append a user message and AI response to MongoDB
 */
export const saveChatMessages = async (userId, userText, modelText) => {
  const now = new Date();

  await ChatHistory.findOneAndUpdate(
    { userId },
    {
      $push: {
        messages: {
          $each: [
            { role: "user",  text: userText,  timestamp: now },
            { role: "model", text: modelText, timestamp: now }
          ]
        }
      }
    },
    { upsert: true, new: true }
  );
};

/**
 * Clear all chat history for a user
 */
export const clearChatHistory = async (userId) => {
  await ChatHistory.findOneAndUpdate(
    { userId },
    { $set: { messages: [] } },
    { upsert: true }
  );
};
