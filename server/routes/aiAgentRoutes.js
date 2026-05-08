import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  completeTask,
} from "../tools/taskTools.js";
import {
  getChatHistory,
  saveChatMessages,
  clearChatHistory,
} from "../tools/chatHistoryTools.js";

const router = express.Router();

// ─── Gemini Client Setup (initialized inside handler to ensure env is ready) ──

// ─── Function Declarations (Tool Schema) ─────────────────────────────────────
const taskFunctionDeclarations = [
  {
    name: "createTask",
    description:
      "Creates a new task for the authenticated user. Use this when the user wants to add, create, or schedule a new task.",
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "The title or name of the task (required).",
        },
        description: {
          type: "string",
          description: "An optional detailed description of the task.",
        },
        status: {
          type: "string",
          enum: ["Pending", "In Progress", "Completed"],
          description:
            "The initial status of the task. Defaults to 'Pending' if not specified.",
        },
        dueDate: {
          type: "string",
          description:
            "The due date of the task in ISO 8601 format (YYYY-MM-DD). Optional.",
        },
      },
      required: ["title"],
    },
  },
  {
    name: "getTasks",
    description:
      "Retrieves all tasks belonging to the authenticated user. Optionally filter by status, search term, or due date. Use this when the user wants to see, list, or view their tasks. For 'today's tasks', use dueDateFrom and dueDateTo with today's date.",
    parameters: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["Pending", "In Progress", "Completed"],
          description:
            "Filter tasks by their status. Omit to retrieve all tasks.",
        },
        search: {
          type: "string",
          description: "A search string to filter tasks by title or description.",
        },
        dueDateFrom: {
          type: "string",
          description: "Filter tasks due FROM this date (ISO format YYYY-MM-DD). Use today's date to get today's tasks.",
        },
        dueDateTo: {
          type: "string",
          description: "Filter tasks due TO this date (ISO format YYYY-MM-DD). Use today's date to get today's tasks.",
        },
      },
      required: [],
    },
  },
  {
    name: "updateTask",
    description:
      "Updates an existing task. You can identify the task by its ID or by its current title. Use this when the user wants to change, modify, or edit a task's details.",
    parameters: {
      type: "object",
      properties: {
        taskId: {
          type: "string",
          description: "The MongoDB ObjectId of the task to update.",
        },
        currentTitle: {
          type: "string",
          description: "The current title of the task to update (if ID is unknown).",
        },
        title: {
          type: "string",
          description: "The NEW title for the task (if changing it).",
        },
        description: {
          type: "string",
          description: "The NEW description for the task.",
        },
        status: {
          type: "string",
          enum: ["Pending", "In Progress", "Completed"],
          description: "The NEW status for the task.",
        },
        dueDate: {
          type: "string",
          description: "The NEW due date in ISO 8601 format (YYYY-MM-DD).",
        },
      },
      required: [],
    },
  },
  {
    name: "deleteTask",
    description:
      "Permanently deletes tasks. You can delete by ID or by title. Use this when the user wants to remove or delete one or more tasks.",
    parameters: {
      type: "object",
      properties: {
        taskId: {
          type: "string",
          description: "The MongoDB ObjectId of a specific task to delete.",
        },
        title: {
          type: "string",
          description: "The title of the task(s) to delete. Useful if the user doesn't provide an ID.",
        },
        deleteAllMatches: {
          type: "boolean",
          description: "Set to true if the user wants to delete ALL tasks matching the title/search.",
        }
      },
      required: [],
    },
  },
  {
    name: "completeTask",
    description:
      "Marks an existing task as completed. You can identify the task by its ID or by its title.",
    parameters: {
      type: "object",
      properties: {
        taskId: {
          type: "string",
          description: "The MongoDB ObjectId of the task to mark as completed.",
        },
        title: {
          type: "string",
          description: "The title of the task to mark as completed.",
        },
      },
      required: [],
    },
  },
];

// ─── Tool Executor ────────────────────────────────────────────────────────────
/**
 * Executes the function called by Gemini and returns a human-readable result.
 * @param {string} fnName - Name of the function Gemini chose to call.
 * @param {object} args   - Arguments extracted by Gemini.
 * @param {string} userId - Authenticated user's MongoDB ID.
 * @returns {Promise<string>} A formatted reply string.
 */
async function executeToolCall(fnName, args, userId) {
  switch (fnName) {
    case "createTask": {
      const task = await createTask(
        {
          title: args.title,
          description: args.description || "",
          status: args.status || "Pending",
          dueDate: args.dueDate || null,
        },
        userId
      );
      return (
        `✅ Task created successfully!\n\n` +
        `Title: ${task.title}\n` +
        (task.description ? `Description: ${task.description}\n` : "") +
        `Status: ${task.status}` +
        (task.dueDate
          ? `\nDue: ${new Date(task.dueDate).toLocaleDateString()}`
          : "") +
        `\nID: ${task._id}`
      );
    }

    case "getTasks": {
      const filters = {};
      if (args.status) filters.status = args.status;
      if (args.search) filters.search = args.search;
      if (args.dueDateFrom) filters.dueDateFrom = args.dueDateFrom;
      if (args.dueDateTo) filters.dueDateTo = args.dueDateTo;
      
      const tasks = await getTasks(userId, filters);

      if (tasks.length === 0) {
        return "You have no tasks yet. Say 'Create a task' to get started!";
      }

      let reply = `You have ${tasks.length} task${tasks.length > 1 ? "s" : ""}:\n\n`;
      tasks.forEach((task, index) => {
        reply += `${index + 1}. ${task.title}\n`;
        reply += `   Status: ${task.status}\n`;
        if (task.description) reply += `   Description: ${task.description}\n`;
        if (task.dueDate)
          reply += `   Due: ${new Date(task.dueDate).toLocaleDateString()}\n`;
        reply += `   ID: ${task._id}\n\n`;
      });
      return reply.trim();
    }

    case "updateTask": {
      let taskId = args.taskId;
      
      if (!taskId && args.currentTitle) {
        const tasks = await getTasks(userId, { search: args.currentTitle });
        if (tasks.length === 0) return `I couldn't find a task named "${args.currentTitle}" to update.`;
        if (tasks.length > 1) return `I found multiple tasks matching "${args.currentTitle}". Please use an ID: ${tasks.map(t => `\`${t._id}\``).join(', ')}`;
        taskId = tasks[0]._id;
      }

      if (!taskId) return "Please provide a task ID or current title to update.";

      const updates = {};
      if (args.title) updates.title = args.title;
      if (args.description) updates.description = args.description;
      if (args.status) updates.status = args.status;
      if (args.dueDate) updates.dueDate = args.dueDate;

      const updatedTask = await updateTask(taskId, userId, updates);
      return (
        `✅ Task updated successfully!\n\n` +
        `Title: ${updatedTask.title}\n` +
        `Status: ${updatedTask.status}`
      );
    }

    case "deleteTask": {
      if (args.taskId) {
        await deleteTask(args.taskId, userId);
        return `Task deleted successfully.`;
      } 
      
      if (args.title) {
        // Find tasks matching this title
        const tasks = await getTasks(userId, { search: args.title });
        
        if (tasks.length === 0) {
          return `I couldn't find any tasks matching "${args.title}" to delete.`;
        }
        
        if (tasks.length > 1 && !args.deleteAllMatches) {
          return `I found ${tasks.length} tasks matching "${args.title}". Which one should I delete? (IDs: ${tasks.map(t => `\`${t._id}\``).join(', ')})`;
        }
        
        // Delete them all (or the only one found)
        let deletedCount = 0;
        for (const task of tasks) {
          await deleteTask(task._id, userId);
          deletedCount++;
        }
        return ` Deleted ${deletedCount} task${deletedCount > 1 ? 's' : ''} matching "${args.title}".`;
      }
      
      return "Please provide a task ID or title to delete.";
    }

    case "completeTask": {
      let taskId = args.taskId;

      if (!taskId && args.title) {
        const tasks = await getTasks(userId, { search: args.title });
        if (tasks.length === 0) return `I couldn't find a task named "${args.title}" to complete.`;
        if (tasks.length > 1) return `I found multiple tasks matching "${args.title}". Which one did you mean? (IDs: ${tasks.map(t => `\`${t._id}\``).join(', ')})`;
        taskId = tasks[0]._id;
      }

      if (!taskId) return "Please provide a task ID or title to complete.";

      const completedTask = await completeTask(taskId, userId);
      return `✅ Task "${completedTask.title}" marked as completed!`;
    }

    default:
      throw new Error(`Unknown tool called by Gemini: ${fnName}`);
  }
}

// ─── AI Agent Route ───────────────────────────────────────────────────────────
router.post("/agent", async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;

    if (!message || typeof message !== "string" || message.trim() === "") {
      return res.status(400).json({ error: "A non-empty 'message' field is required." });
    }

    console.log("AI Agent Request:", { message, userId });

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Initialise Gemini model with tool declarations
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      tools: [{ functionDeclarations: taskFunctionDeclarations }],
      systemInstruction:
        `You are an intelligent task management assistant. ` +
        `Today's date is ${new Date().toISOString().split("T")[0]}. ` +
        `Use the provided tools to create, list, update, delete, or complete tasks on behalf of the user. ` +
        `IMPORTANT: Never use markdown formatting like **bold**, *italic*, or backticks in your responses. Use plain text only. ` +
        `When the user wants to CREATE a task, you MUST collect ALL of the following details before calling the createTask tool. Ask for all of them in ONE single message: ` +
        `1. Title (required) ` +
        `2. Description (optional, but ask for it) ` +
        `3. Due date (optional, but ask for it) ` +
        `4. Status - ask them to choose from: Pending, In Progress, or Completed (default is Pending) ` +
        `Ask all questions together in one message like: "Please provide the following details to create your task: Title, Description, Due date, Status (Pending / In Progress / Completed)". ` +
        `Only call createTask after the user has provided at least the title. Use defaults for anything not provided (status = Pending, no due date, no description). ` +
        `When the user asks for "today's tasks", call getTasks with dueDateFrom and dueDateTo both set to today's date (${new Date().toISOString().split("T")[0]}). ` +
        `When a task ID is needed and the user has not provided one, ask them to share it or suggest listing tasks first.`,
    });

    // ── Step 1: Fetch existing conversation history from MongoDB ──
    const history = await getChatHistory(userId);
    console.log(`Loaded ${history.length} messages from history for user ${userId}`);

    // ── Step 2: Start a chat session with the full history ──
    const chat = model.startChat({ history });

    // ── Step 3: Send the new user message ──
    const result = await chat.sendMessage(message.trim());
    const response = result.response;

    // ── Step 4: Check if Gemini requested a tool call ──
    const candidate = response.candidates?.[0];
    const parts = candidate?.content?.parts ?? [];
    const functionCallPart = parts.find((p) => p.functionCall);

    let finalReply;

    if (functionCallPart) {
      const { name: fnName, args } = functionCallPart.functionCall;
      console.log("Gemini Tool Call:", { fnName, args });

      // Execute the tool
      finalReply = await executeToolCall(fnName, args, userId);
      console.log("Tool Result:", finalReply);
    } else {
      // Plain text response
      finalReply = response.text();
      console.log("Gemini Text Reply:", finalReply);
    }

    // ── Step 5: Save both user message and AI response to MongoDB ──
    await saveChatMessages(userId, message.trim(), finalReply);

    return res.json({ reply: finalReply });

  } catch (error) {
    console.error("AI Agent Error:", error);
    return res.status(500).json({
      error: "AI Agent encountered an error.",
      message: error.message,
    });
  }
});

// ─── Clear Chat History Route ─────────────────────────────────────────────────
router.delete("/history", async (req, res) => {
  try {
    const userId = req.user.id;
    await clearChatHistory(userId);
    console.log(`Chat history cleared for user ${userId}`);
    return res.json({ message: "Chat history cleared successfully." });
  } catch (error) {
    console.error("Clear History Error:", error);
    return res.status(500).json({ error: "Failed to clear chat history." });
  }
});

export default router;
