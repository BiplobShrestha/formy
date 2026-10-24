const express = require("express");
const Application = require("../models/Application");
const CitizenRecord = require("../models/CitizenRecord");
const Notice = require("../models/Notice");
const { requireAuth, requireRole } = require("../middleware/auth");
const { wrap, validId } = require("../lib/http");
const { buildMatch, publicRecord, escapeRegex } = require("../lib/match");
const { summary, addHistory } = require("../lib/appview");

const router = express.Router();
router.use(requireAuth, requireRole("admin"));

const STATUSES = ["pending", "forwarded", "approved", "rejected"];

async function loadApp(req, res) {
  if (!validId(req.params.id)) {
    res.status(404).json({ message: "Application not found" });
    return null;
  }
  const app = await Application.findById(req.params.id);
  if (!app) {
    res.status(404).json({ message: "Application not found" });
    return null;
  }
  return app;
}

// Applications list with counts
router.get(
  "/applications",
  wrap(async (req, res) => {
    const filter = STATUSES.includes(req.query.status) ? { status: req.query.status } : {};
    const apps = await Application.find(filter).sort({ updatedAt: -1 });

    const counts = { all: await Application.countDocuments({}) };
    for (const s of STATUSES) counts[s] = await Application.countDocuments({ status: s });

    res.json({ applications: apps.map(summary), counts });
  })
);

// Search the citizen records
router.get(
  "/records",
  wrap(async (req, res) => {
    const q = String(req.query.q || "").trim().slice(0, 60);
    let filter = {};
    if (q) {
      const re = new RegExp(escapeRegex(q), "i");
      filter = { $or: [{ fullName: re }, { phone: re }, { citizenshipNumber: re }] };
    }
    const records = await CitizenRecord.find(filter).sort({ fullName: 1 }).limit(15);
    res.json({ records: records.map(publicRecord) });
  })
);

// Pick a record by hand when the automatic match is wrong or missing
router.put(
  "/applications/:id/record",
  wrap(async (req, res) => {
    const app = await loadApp(req, res);
    if (!app) return;
    if (app.status !== "pending") return res.status(400).json({ message: "This application is no longer pending" });
    if (!validId(req.body.recordId)) return res.status(400).json({ message: "Choose a valid record" });

    const record = await CitizenRecord.findById(req.body.recordId);
    if (!record) return res.status(404).json({ message: "Record not found" });

    app.linkedRecord = record._id;
    addHistory(app, req.user, "Linked citizen record", record.fullName);
    await app.save();
    res.json({ match: await buildMatch(app.data, app.linkedRecord, app.service) });
  })
);

// Forward to the government officer
router.post(
  "/applications/:id/forward",
  wrap(async (req, res) => {
    const app = await loadApp(req, res);
    if (!app) return;
    if (app.status !== "pending") return res.status(400).json({ message: "This application is no longer pending" });

    const match = await buildMatch(app.data, app.linkedRecord, app.service);
    if (!match.record) {
      return res.status(400).json({
        message: "No citizen record is linked. Search for the record first, or reject this application.",
      });
    }

    const problems = match.docChecks.filter((c) => c.problem);
    if (problems.length) {
      return res.status(400).json({ message: problems.map((c) => c.problem).join(" ") + " Reject the application instead." });
    }

    const confirmed = Array.isArray(req.body.confirmed) ? req.body.confirmed : [];
    const missing = match.docChecks.filter((c) => !confirmed.includes(c.key));
    if (missing.length) {
      return res.status(400).json({ message: "Check every document against its record first: " + missing.map((c) => c.title).join(", ") + "." });
    }

    const note = String(req.body.note || "").trim().slice(0, 300);
    app.status = "forwarded";
    app.linkedRecord = match.record.id;
    const checked = match.docChecks.map((c) => c.title).join(", ");
    addHistory(app, req.user, "Forwarded to officer", [checked && `Documents checked: ${checked}.`, note].filter(Boolean).join(" "));
    await app.save();
    res.json({ ok: true });
  })
);

// Reject with a reason
router.post(
  "/applications/:id/reject",
  wrap(async (req, res) => {
    const app = await loadApp(req, res);
    if (!app) return;
    if (app.status !== "pending") return res.status(400).json({ message: "This application is no longer pending" });

    const reason = String(req.body.reason || "").trim();
    if (reason.length < 5) return res.status(400).json({ message: "Please write the reason for rejection" });

    app.status = "rejected";
    app.rejectedBy = "admin";
    app.rejectionReason = reason.slice(0, 500);
    app.decidedAt = new Date();
    addHistory(app, req.user, "Rejected by admin", app.rejectionReason);
    await app.save();
    res.json({ ok: true });
  })
);

// Notices
router.get(
  "/notices",
  wrap(async (req, res) => {
    const notices = await Notice.find({}).sort({ createdAt: -1 });
    res.json({ notices });
  })
);

router.post(
  "/notices",
  wrap(async (req, res) => {
    const title = String(req.body.title || "").trim();
    const body = String(req.body.body || "").trim();
    if (!title || !body) return res.status(400).json({ message: "Title and text are both required" });
    const notice = await Notice.create({ title: title.slice(0, 120), body: body.slice(0, 600), active: true });
    res.status(201).json({ notice });
  })
);

router.put(
  "/notices/:id",
  wrap(async (req, res) => {
    if (!validId(req.params.id)) return res.status(404).json({ message: "Notice not found" });
    const notice = await Notice.findById(req.params.id);
    if (!notice) return res.status(404).json({ message: "Notice not found" });

    if (req.body.title !== undefined) notice.title = String(req.body.title).trim().slice(0, 120) || notice.title;
    if (req.body.body !== undefined) notice.body = String(req.body.body).trim().slice(0, 600) || notice.body;
    if (req.body.active !== undefined) notice.active = !!req.body.active;
    await notice.save();
    res.json({ notice });
  })
);

router.delete(
  "/notices/:id",
  wrap(async (req, res) => {
    if (!validId(req.params.id)) return res.status(404).json({ message: "Notice not found" });
    await Notice.deleteOne({ _id: req.params.id });
    res.json({ ok: true });
  })
);

module.exports = router;
