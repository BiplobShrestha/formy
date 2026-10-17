const express = require("express");
const Notice = require("../models/Notice");

const router = express.Router();

// Public: active notices, newest first
router.get("/", async (req, res) => {
  try {
    const notices = await Notice.find({ active: true }).sort({ createdAt: -1 }).limit(10);
    res.json({ notices });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not load notices" });
  }
});

module.exports = router;
