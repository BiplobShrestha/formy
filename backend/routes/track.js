const express = require("express");
const Application = require("../models/Application");
const { getService } = require("../config/services");
const hitLimit = require("../lib/hitlimit");
const { wrap } = require("../lib/http");

const router = express.Router();

// Public: look up the status of an application by its reference number.
// Only the service, status and dates are returned, never any personal details.
router.get(
  "/:ref",
  hitLimit(20, 60 * 1000),
  wrap(async (req, res) => {
    const ref = String(req.params.ref || "").trim().toUpperCase();
    if (!/^FRM-\d{8}-[0-9A-F]{4}$/.test(ref)) {
      return res.status(404).json({ message: "No application found with that reference number" });
    }
    const app = await Application.findOne({ ref });
    if (!app) return res.status(404).json({ message: "No application found with that reference number" });
    const service = getService(app.service);
    res.json({
      application: {
        ref: app.ref,
        serviceTitle: service ? service.title : app.service,
        status: app.status,
        rejectedBy: app.rejectedBy,
        submittedAt: app.createdAt,
        updatedAt: app.updatedAt,
      },
    });
  })
);

module.exports = router;
