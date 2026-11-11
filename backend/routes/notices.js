const express = require("express");
const Notice = require("../models/Notice");
const File = require("../models/File");
const { wrap, validId } = require("../lib/http");

const router = express.Router();

function publicNotice(n) {
  return { _id: String(n._id), title: n.title, body: n.body, hasImage: !!n.image };
}

// Public: active notices, newest first
router.get("/", async (req, res) => {
  try {
    const notices = await Notice.find({ active: true }).sort({ createdAt: -1 }).limit(10);
    res.json({ notices: notices.map(publicNotice) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not load notices" });
  }
});

// Public: the picture of an active notice
router.get(
  "/:id/image",
  wrap(async (req, res) => {
    if (!validId(req.params.id)) return res.status(404).json({ message: "Not found" });
    const notice = await Notice.findById(req.params.id);
    if (!notice || !notice.active || !notice.image || !validId(notice.image)) return res.status(404).json({ message: "Not found" });
    const file = await File.findById(notice.image);
    if (!file) return res.status(404).json({ message: "Not found" });
    res.set("Content-Type", file.mimeType);
    res.set("Cache-Control", "public, max-age=300");
    res.send(file.data);
  })
);

module.exports = router;
