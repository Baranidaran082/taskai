import express from "express";
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  completeTask
} from "../tools/taskTools.js";

const router = express.Router();

/**
 * Turns a thrown error into an HTTP response.
 * Mongoose CastError means the :id in the URL is not a valid ObjectId, which is
 * a client mistake (400) rather than a server failure.
 */
const sendError = (res, error) => {
  if (error.name === "CastError") {
    return res.status(400).json({ message: "Invalid task id" });
  }
  if (error.name === "ValidationError") {
    return res.status(400).json({ message: error.message });
  }

  const status = error.status || 500;
  if (status === 500) console.error("Task route error:", error);

  return res.status(status).json({ message: error.message });
};


// CREATE TASK
router.post("/tasks", async (req, res) => {
  try {
    const task = await createTask(req.body, req.user.id);
    res.status(201).json(task);
  } catch (error) {
    sendError(res, error);
  }
});


// GET TASKS
router.get("/tasks", async (req, res) => {
  try {
    const tasks = await getTasks(req.user.id, req.query);
    res.json(tasks);
  } catch (error) {
    sendError(res, error);
  }
});


// UPDATE TASK
router.put("/tasks/:id", async (req, res) => {
  try {
    const task = await updateTask(req.params.id, req.user.id, req.body);
    res.json(task);
  } catch (error) {
    sendError(res, error);
  }
});


// COMPLETE TASK
router.patch("/tasks/:id/complete", async (req, res) => {
  try {
    const task = await completeTask(req.params.id, req.user.id);
    res.json(task);
  } catch (error) {
    sendError(res, error);
  }
});


// DELETE TASK
router.delete("/tasks/:id", async (req, res) => {
  try {
    await deleteTask(req.params.id, req.user.id);
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    sendError(res, error);
  }
});

export default router;
