// Must be the first import: ES module bodies are evaluated in import order, so
// loading .env here guarantees process.env is populated before the route
// modules below are evaluated.
import "dotenv/config";

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import aiAgentRoutes from "./routes/aiAgentRoutes.js";
import User from "./models/User.js";
import taskRoutes from "./routes/taskRoutes.js";

const PORT = process.env.PORT || 5000;
const IS_PROD = process.env.NODE_ENV === "production";
const TOKEN_MAX_AGE = 24 * 60 * 60 * 1000; // 24h — keep in sync with JWT expiresIn

// Allow the deployed frontend plus local development origins.
const allowedOrigins = [
  process.env.CLIENT_URL,
  "https://taskai-mern.vercel.app",
  "http://localhost:3000"
].filter(Boolean);

// Cookie options must be identical when setting and clearing, otherwise the
// browser will not remove the cookie on logout.
const cookieOptions = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: IS_PROD ? "none" : "lax"
};

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser clients (curl, health checks) which send no origin.
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
    credentials: true
  })
);

app.use(express.json());
app.use(cookieParser());

if (!process.env.MONGO_URI) {
  console.error("MONGO_URI is not set. Add it to server/.env before starting.");
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is not set. Add it to server/.env before starting.");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB connection failed:", err.message));


// Auth Middleware
const authMiddleware = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();

  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};


// Register
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name?.trim() || !email?.trim() || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword
    });

    res.status(201).json({ message: "User registered successfully" });

  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Registration failed" });
  }
});


// Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email?.trim() || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    // Same message for both cases so the endpoint does not reveal which
    // emails exist.
    const invalid = { message: "Invalid email or password" };

    if (!user) {
      return res.status(400).json(invalid);
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json(invalid);
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h"
    });

    res.cookie("token", token, { ...cookieOptions, maxAge: TOKEN_MAX_AGE });

    res.json({ message: "Login successful", name: user.name, email: user.email });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
});


// Logout
app.post("/logout", (req, res) => {
  res.clearCookie("token", cookieOptions);
  res.json({ message: "Logged out successfully" });
});


// Verify auth status
app.get("/me", authMiddleware, (req, res) => {
  res.json({ authenticated: true });
});

// Task Routes (manual CRUD)
app.use("/", authMiddleware, taskRoutes);

// AI Agent Routes (with auth middleware)
app.use("/api/ai", authMiddleware, aiAgentRoutes);


// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
