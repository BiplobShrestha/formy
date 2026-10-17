const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Nepali mobile numbers: 10 digits starting with 97 or 98
const PHONE_RE = /^9[78]\d{8}$/;

function signToken(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

function publicUser(user) {
  return { id: user._id, name: user.name, phone: user.phone, role: user.role };
}

router.post("/register", async (req, res) => {
  try {
    const name = (req.body.name || "").trim();
    const phone = (req.body.phone || "").trim();
    const password = req.body.password || "";

    if (name.length < 2) {
      return res.status(400).json({ message: "Please enter your full name" });
    }
    if (!PHONE_RE.test(phone)) {
      return res
        .status(400)
        .json({ message: "Enter a valid 10 digit phone number starting with 97 or 98" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const exists = await User.findOne({ phone });
    if (exists) {
      return res.status(409).json({ message: "This phone number is already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, phone, passwordHash, role: "customer" });

    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong, try again" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const phone = (req.body.phone || "").trim();
    const password = req.body.password || "";

    const user = await User.findOne({ phone });
    const ok = user && (await bcrypt.compare(password, user.passwordHash));
    if (!ok) {
      return res.status(401).json({ message: "Wrong phone number or password" });
    }

    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong, try again" });
  }
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

module.exports = router;
