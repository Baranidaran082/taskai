import Task from "../models/Task.js";


// CREATE
export const createTask = async (taskData, userId) => {
  const task = new Task({
    ...taskData,
    status: taskData.status || "Pending",
    userId
  });

  return await task.save();
};


// GET ALL TASKS
export const getTasks = async (userId, filters = {}) => {
  let filter = { userId };

  if (filters.status && filters.status !== "all") {
    filter.status = filters.status;
  }

  if (filters.search) {
    filter.$or = [
      { title: { $regex: filters.search, $options: "i" } },
      { description: { $regex: filters.search, $options: "i" } }
    ];
  }

  return await Task.find(filter).sort({ createdAt: -1 });
};


// UPDATE
export const updateTask = async (taskId, userId, updateData) => {
  return await Task.findOneAndUpdate(
    { _id: taskId, userId },
    updateData,
    { new: true }
  );
};


// DELETE
export const deleteTask = async (taskId, userId) => {
  return await Task.findOneAndDelete({
    _id: taskId,
    userId
  });
};


// COMPLETE
export const completeTask = async (taskId, userId) => {
  return await Task.findOneAndUpdate(
    { _id: taskId, userId },
    { status: "Completed" },
    { new: true }
  );
};


// GET SINGLE TASK
export const getTaskById = async (taskId, userId) => {
  return await Task.findOne({
    _id: taskId,
    userId
  });
};