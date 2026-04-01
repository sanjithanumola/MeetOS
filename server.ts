import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import path from "path";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import { GoogleGenAI, Type } from "@google/genai";
import { OpenAI } from "openai";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const PORT = 3000;

// Gemini Setup
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

// Supabase Setup
const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

let supabase: any;
if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey);
} else {
  console.error("Supabase environment variables are missing. Database features will be disabled.");
}

// Multer Setup
const upload = multer({ dest: "uploads/" });

// Ensure uploads directory exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Socket.IO
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join-meeting", (meetingId) => {
    socket.join(`meeting-${meetingId}`);
    console.log(`User joined meeting: ${meetingId}`);
  });

  socket.on("send-comment", async (data) => {
    const { meetingId, userId, content, userName } = data;
    // Broadcast to others in the meeting room
    io.to(`meeting-${meetingId}`).emit("new-comment", {
      id: Date.now().toString(),
      meeting_id: meetingId,
      user_id: userId,
      content,
      user_name: userName,
      created_at: new Date().toISOString(),
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Save Processed Meeting
app.post("/api/meetings/save", async (req, res) => {
  try {
    const { userId, title, transcript, analysis } = req.body;

    if (!userId || !transcript || !analysis) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Save to Supabase
    if (!supabase) {
      return res.status(500).json({ error: "Database not configured" });
    }
    const { data, error } = await supabase
      .from("meetings")
      .insert([
        {
          user_id: userId,
          title: title || "Untitled Meeting",
          transcript,
          analysis,
          created_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ error: `Database error: ${error.message}` });
    }

    res.json(data);
  } catch (error: any) {
    console.error("Save error:", error);
    res.status(500).json({ error: error.message || "An unexpected error occurred while saving" });
  }
});

// Get all meetings
app.get("/api/meetings", async (req, res) => {
  if (!supabase) return res.status(500).json({ error: "Database not configured" });
  const { userId } = req.query;
  const { data, error } = await supabase
    .from("meetings")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Get single meeting
app.get("/api/meetings/:id", async (req, res) => {
  if (!supabase) return res.status(500).json({ error: "Database not configured" });
  const { id } = req.params;
  const { data, error } = await supabase
    .from("meetings")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
