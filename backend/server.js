require("dotenv").config();
const mongoose = require("mongoose");

const { MONGODB_URI, JWT_SECRET } = process.env;

if (!MONGODB_URI || !JWT_SECRET) {
  console.error("Missing MONGODB_URI or JWT_SECRET environment variable.");
  process.exit(1);
}

const app = require("./app");
const seed = require("./seed/seed");

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "Formy",
    version: "v4",
    db: mongoose.connection.readyState === 1 ? "connected" : "not connected",
  });
});

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
