const crypto = require("crypto");
const Application = require("../models/Application");
const { getService } = require("../config/services");

function serialize(app) {
  const service = getService(app.service);
  return {
    id: String(app._id),
    ref: app.ref,
    service: app.service,
    serviceTitle: service ? service.title : app.service,
    data: app.data,
    status: app.status,
    rejectedBy: app.rejectedBy,
    rejectionReason: app.rejectionReason,
    history: app.history,
    createdAt: app.createdAt,
    updatedAt: app.updatedAt,
    decidedAt: app.decidedAt,
  };
}

// Short version used in lists
function summary(app) {
  const service = getService(app.service);
  return {
    id: String(app._id),
    ref: app.ref,
    serviceTitle: service ? service.title : app.service,
    applicantName: app.data && app.data.fullName ? app.data.fullName : "",
    applicantPhone: app.data && app.data.phone ? app.data.phone : "",
    status: app.status,
    rejectedBy: app.rejectedBy,
    createdAt: app.createdAt,
    updatedAt: app.updatedAt,
  };
}

// The service definition sent to the browser (plain data only)
function publicService(s) {
  return { key: s.key, title: s.title, description: s.description, maxFileKB: s.maxFileKB, fields: s.fields };
}

async function newRef() {
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  for (;;) {
    const ref = `FRM-${stamp}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;
    const exists = await Application.findOne({ ref });
    if (!exists) return ref;
  }
}

function officerCanSee(app) {
  return app.status === "forwarded" || app.status === "approved" || (app.status === "rejected" && app.rejectedBy === "officer");
}

function addHistory(app, user, action, note = "") {
  app.history.push({ at: new Date(), actor: user.name, role: user.role, action, note });
}

module.exports = { serialize, summary, publicService, newRef, officerCanSee, addHistory };
