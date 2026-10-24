const express = require("express");
const multer = require("multer");
const File = require("../models/File");
const { requireAuth, requireRole } = require("../middleware/auth");
const { wrap, validId } = require("../lib/http");

const router = express.Router();

const MAX_BYTES = 1024 * 1024; // 1 MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES, files: 1 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") cb(null, true);
    else cb(new Error("Only JPG or PNG images are allowed"));
  },
});

// Customers upload their document photos
router.post("/", requireAuth, requireRole("customer"), (req, res) => {
  upload.single("file")(req, res, async (err) => {
    if (err) {
      const message = err.code === "LIMIT_FILE_SIZE" ? "File is too large (1 MB maximum)" : err.message;
      return res.status(400).json({ message });
    }
    if (!req.file) return res.status(400).json({ message: "No file received" });
    try {
      const file = await File.create({
        owner: req.user._id,
        name: req.file.originalname.slice(0, 120),
        mimeType: req.file.mimetype,
        size: req.file.size,
        data: req.file.buffer,
      });
      res.status(201).json({ file: { id: String(file._id), name: file.name, size: file.size, mimeType: file.mimeType } });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Could not save the file" });
    }
  });
});

// The owner, admin and officer can view a file
router.get(
  "/:id",
  requireAuth,
  wrap(async (req, res) => {
    if (!validId(req.params.id)) return res.status(404).json({ message: "File not found" });
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ message: "File not found" });

    const isOwner = String(file.owner) === String(req.user._id);
    if (!isOwner && req.user.role === "customer") {
      return res.status(403).json({ message: "You do not have access to this" });
    }
    res.set("Content-Type", file.mimeType);
    res.set("Cache-Control", "private, max-age=300");
    res.send(file.data);
  })
);

module.exports = router;
