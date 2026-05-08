import express from "express";
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  completeTask
} from "../tools/taskTools.js";

const router = express.Router();


// CREATE TASK
router.post("/tasks", async (req, res) => {
  try {
    const task = await createTask(req.body, req.user.id);
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// GET TASKS
router.get("/tasks", async (req, res) => {
  try {
    const tasks = await getTasks(req.user.id, req.query);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// UPDATE TASK
router.put("/tasks/:id", async (req, res) => {
  try {
    const task = await updateTask(
      req.params.id,
      req.user.id,
      req.body
    );

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// COMPLETE TASK
router.patch("/tasks/:id/complete", async (req, res) => {
  try {
    const task = await completeTask(
      req.params.id,
      req.user.id
    );

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// DELETE TASK
router.delete("/tasks/:id", async (req, res) => {
  try {
    const result = await deleteTask(
      req.params.id,
      req.user.id
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;