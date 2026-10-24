const express = require("express");
const Application = require("../models/Application");
const { getService } = require("../config/services");
const { requireAuth, requireRole } = require("../middleware/auth");
const { wrap, validId } = require("../lib/http");
const { validateApplicationData } = require("../lib/validate");
const { buildMatch } = require("../lib/match");
const { buildCustomerLetter, buildOfficerLetter } = require("../lib/letters");
const { serialize, summary, publicService, newRef, officerCanSee, addHistory } = require("../lib/appview");

const router = express.Router();
router.use(requireAuth);

function canView(user, app) {
  if (user.role === "admin") return true;
  if (user.role === "officer") return officerCanSee(app);
  return String(app.user) === String(user._id);
}

// Create a new application (customers)
router.post(
  "/",
  requireRole("customer"),
  wrap(async (req, res) => {
    const service = getService(req.body.service);
    if (!service) return res.status(400).json({ message: "Unknown service" });

    const { errors, clean } = await validateApplicationData(service, req.body.data, req.user._id);
    if (Object.keys(errors).length) {
      return res.status(400).json({ message: "Please fix the highlighted fields", errors });
    }

    const app = new Application({
      ref: await newRef(),
      user: req.user._id,
      service: service.key,
      data: clean,
      status: "pending",
    });
    addHistory(app, req.user, "Submitted");
    await app.save();
    res.status(201).json({ application: serialize(app) });
  })
);

// My applications
router.get(
  "/mine",
  requireRole("customer"),
  wrap(async (req, res) => {
    const apps = await Application.find({ user: req.user._id }).sort({ updatedAt: -1 });
    res.json({ applications: apps.map(summary) });
  })
);

// One application (owner, admin, or officer once forwarded)
router.get(
  "/:id",
  wrap(async (req, res) => {
    if (!validId(req.params.id)) return res.status(404).json({ message: "Application not found" });
    const app = await Application.findById(req.params.id);
    if (!app || !canView(req.user, app)) return res.status(404).json({ message: "Application not found" });

    const service = getService(app.service);
    const body = { application: serialize(app), service: service ? publicService(service) : null };
    if (req.user.role === "admin" || req.user.role === "officer") {
      body.match = await buildMatch(app.data, app.linkedRecord, app.service);
    }
    res.json(body);
  })
);

// Edit and resubmit a rejected application (owner only)
router.put(
  "/:id",
  requireRole("customer"),
  wrap(async (req, res) => {
    if (!validId(req.params.id)) return res.status(404).json({ message: "Application not found" });
    const app = await Application.findById(req.params.id);
    if (!app || String(app.user) !== String(req.user._id)) {
      return res.status(404).json({ message: "Application not found" });
    }
    if (app.status !== "rejected") {
      return res.status(400).json({ message: "Only rejected applications can be edited and resubmitted" });
    }

    const service = getService(app.service);
    const { errors, clean } = await validateApplicationData(service, req.body.data, req.user._id);
    if (Object.keys(errors).length) {
      return res.status(400).json({ message: "Please fix the highlighted fields", errors });
    }

    app.data = clean;
    app.markModified("data");
    app.status = "pending";
    app.rejectedBy = null;
    app.rejectionReason = "";
    app.linkedRecord = null;
    app.decidedAt = null;
    addHistory(app, req.user, "Resubmitted");
    await app.save();
    res.json({ application: serialize(app) });
  })
);

// PDF letters. ?type=customer (decision letter) or ?type=officer (formal letter with attachments)
router.get(
  "/:id/letter",
  wrap(async (req, res) => {
    if (!validId(req.params.id)) return res.status(404).json({ message: "Application not found" });
    const app = await Application.findById(req.params.id);
    if (!app || !canView(req.user, app)) return res.status(404).json({ message: "Application not found" });
    const service = getService(app.service);

    const type = req.query.type === "officer" ? "officer" : "customer";
    let pdf;
    if (type === "customer") {
      if (app.status !== "approved" && app.status !== "rejected") {
        return res.status(400).json({ message: "The decision letter is available after a decision is made" });
      }
      pdf = await buildCustomerLetter(app, service);
    } else {
      if (req.user.role === "customer") {
        return res.status(403).json({ message: "You do not have access to this" });
      }
      pdf = await buildOfficerLetter(app, service);
    }

    res.set("Content-Type", "application/pdf");
    res.set("Content-Disposition", `inline; filename="${app.ref}-${type}-letter.pdf"`);
    res.send(pdf);
  })
);

module.exports = router;
