import Task from "../models/Task.js";

// User input is used inside a $regex, so metacharacters must be neutralised.
// Without this a title like "c++" or "(draft" makes MongoDB throw.
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const notFound = () => {
  const error = new Error("Task not found");
  error.status = 404;
  return error;
};


// CREATE
export const createTask = async (taskData, userId) => {
  const { title, description, status, priority, dueDate } = taskData;

  if (!title || !title.trim()) {
    const error = new Error("Task title is required");
    error.status = 400;
    throw error;
  }

  return await Task.create({
    title: title.trim(),
    description: description || "",
    status: status || "Pending",
    priority: priority || "Medium",
    dueDate: dueDate || null,
    userId
  });
};


// GET ALL TASKS
export const getTasks = async (userId, filters = {}) => {
  const filter = { userId };

  if (filters.status && filters.status !== "all") {
    filter.status = filters.status;
  }

  if (filters.search) {
    const pattern = escapeRegex(filters.search.trim());
    filter.$or = [
      { title: { $regex: pattern, $options: "i" } },
      { description: { $regex: pattern, $options: "i" } }
    ];
  }

  // Date filters are inclusive: dueDateFrom starts at 00:00 and dueDateTo ends
  // at 23:59:59.999, so passing the same date for both returns that whole day.
  const dueDate = {};

  if (filters.dueDateFrom) {
    const from = new Date(filters.dueDateFrom);
    if (!isNaN(from)) {
      from.setHours(0, 0, 0, 0);
      dueDate.$gte = from;
    }
  }

  if (filters.dueDateTo) {
    const to = new Date(filters.dueDateTo);
    if (!isNaN(to)) {
      to.setHours(23, 59, 59, 999);
      dueDate.$lte = to;
    }
  }

  if (Object.keys(dueDate).length > 0) {
    filter.dueDate = dueDate;
  }

  return await Task.find(filter).sort({ createdAt: -1 });
};


// UPDATE
export const updateTask = async (taskId, userId, updateData) => {
  const task = await Task.findOneAndUpdate(
    { _id: taskId, userId },
    updateData,
    { new: true, runValidators: true }
  );

  if (!task) throw notFound();

  return task;
};


// DELETE
export const deleteTask = async (taskId, userId) => {
  const task = await Task.findOneAndDelete({ _id: taskId, userId });

  if (!task) throw notFound();

  return task;
};


// COMPLETE
export const completeTask = async (taskId, userId) => {
  const task = await Task.findOneAndUpdate(
    { _id: taskId, userId },
    { status: "Completed" },
    { new: true }
  );

  if (!task) throw notFound();

  return task;
};


// GET SINGLE TASK
export const getTaskById = async (taskId, userId) => {
  return await Task.findOne({ _id: taskId, userId });
};
