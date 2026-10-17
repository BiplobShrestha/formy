require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Formy API is running (v0)");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "Formy", version: "v0" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Formy API listening on port ${PORT}`));
