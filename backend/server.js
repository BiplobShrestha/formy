require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const seed = require("./seed/seed");
const authRoutes = require("./routes/auth");
const noticeRoutes = require("./routes/notices");

const { MONGODB_URI, JWT_SECRET, FRONTEND_URL } = process.env;

if (!MONGODB_URI || !JWT_SECRET) {
  console.error("Missing MONGODB_URI or JWT_SECRET environment variable.");
  process.exit(1);
}

const app = express();

app.use(
  cors({
    origin: FRONTEND_URL ? FRONTEND_URL.split(",").map((s) => s.trim()) : true,
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Formy API is running (v1)");
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "Formy",
    version: "v1",
    db: mongoose.connection.readyState === 1 ? "connected" : "not connected",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/notices", noticeRoutes);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log("MongoDB connected");
    await seed();
    app.listen(PORT, () => console.log(`Formy API listening on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Startup failed:", err.message);
    process.exit(1);
  });
