import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import axios from "axios";
import cookieParser from "cookie-parser";
import aiAgentRoutes from "./routes/aiAgentRoutes.js";
import User from "./models/User.js";
import taskRoutes from "./routes/taskRoutes.js";
import dotenv from "dotenv";

const app = express();

app.use(
  cors({
    origin: "https://taskai-mern.vercel.app",
    credentials: true
  })
);

app.use(express.json());
app.use(cookieParser());



dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));


// Auth Middleware
const authMiddleware = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();

  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};


// Register
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name: name.trim(),
      email,
      password: hashedPassword
    });

    await user.save();

    res.json({ message: "User registered successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Wrong password" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET
    );

    res.cookie("token", token, {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  // maxAge: 24 * 60 * 60 * 1000
});

    res.json({ message: "Login successful", name: user.name, email: user.email });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Logout
app.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});


// Task Routes (manual CRUD)
app.use("/", authMiddleware, taskRoutes);

// AI Agent Routes (with auth middleware)
app.use("/api/ai", authMiddleware, aiAgentRoutes);

// Start Server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});