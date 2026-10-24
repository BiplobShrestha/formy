const express = require("express");
const Application = require("../models/Application");
const { requireAuth, requireRole } = require("../middleware/auth");
const { wrap, validId } = require("../lib/http");
const { summary, addHistory } = require("../lib/appview");

const router = express.Router();
router.use(requireAuth, requireRole("officer"));

// tab=pending (waiting for the officer), decided (approved or rejected by the officer), or all
router.get(
  "/applications",
  wrap(async (req, res) => {
    const pendingFilter = { status: "forwarded" };
    const decidedFilter = { $or: [{ status: "approved" }, { status: "rejected", rejectedBy: "officer" }] };

    const tab = req.query.tab;
    const filter =
      tab === "pending" ? pendingFilter : tab === "decided" ? decidedFilter : { $or: [pendingFilter, ...decidedFilter.$or] };

    const apps = await Application.find(filter).sort({ updatedAt: -1 });
    const counts = {
      pending: await Application.countDocuments(pendingFilter),
      decided: await Application.countDocuments(decidedFilter),
    };
    res.json({ applications: apps.map(summary), counts });
  })
);

async function loadForwarded(req, res) {
  if (!validId(req.params.id)) {
    res.status(404).json({ message: "Application not found" });
    return null;
  }
  const app = await Application.findById(req.params.id);
  if (!app || app.status !== "forwarded") {
    res.status(404).json({ message: "This application is not waiting for your decision" });
    return null;
  }
  return app;
}

router.post(
  "/applications/:id/verify",
  wrap(async (req, res) => {
    const app = await loadForwarded(req, res);
    if (!app) return;

    app.status = "approved";
    app.rejectedBy = null;
    app.rejectionReason = "";
    app.decidedAt = new Date();
    addHistory(app, req.user, "Approved by officer", String(req.body.note || "").trim().slice(0, 300));
    await app.save();
    res.json({ ok: true });
  })
);

router.post(
  "/applications/:id/reject",
  wrap(async (req, res) => {
    const app = await loadForwarded(req, res);
    if (!app) return;

    const reason = String(req.body.reason || "").trim();
    if (reason.length < 5) return res.status(400).json({ message: "Please write the reason for rejection" });

    app.status = "rejected";
    app.rejectedBy = "officer";
    app.rejectionReason = reason.slice(0, 500);
    app.decidedAt = new Date();
    addHistory(app, req.user, "Rejected by officer", app.rejectionReason);
    await app.save();
    res.json({ ok: true });
  })
);

module.exports = router;
