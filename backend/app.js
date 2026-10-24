const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const noticeRoutes = require("./routes/notices");
const serviceRoutes = require("./routes/services");
const fileRoutes = require("./routes/files");
const applicationRoutes = require("./routes/applications");
const adminRoutes = require("./routes/admin");
const officerRoutes = require("./routes/officer");

const { FRONTEND_URL } = process.env;

const app = express();
// Render sits behind a proxy, so use the real client address for login throttling
app.set("trust proxy", 1);

app.use(
  cors({
    origin: FRONTEND_URL ? FRONTEND_URL.split(",").map((s) => s.trim()) : true,
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Formy API is running (v3)");
});

app.use("/api/auth", authRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/officer", officerRoutes);

app.use((req, res) => res.status(404).json({ message: "Not found" }));

module.exports = app;
