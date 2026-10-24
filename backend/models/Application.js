const mongoose = require("mongoose");

const historySchema = new mongoose.Schema(
  {
    at: { type: Date, default: Date.now },
    actor: { type: String, required: true },
    role: { type: String, required: true },
    action: { type: String, required: true },
    note: { type: String, default: "" },
  },
  { _id: false }
);

// status: pending (waiting for admin) -> forwarded (with officer) -> approved | rejected
// A rejected application can be edited and resubmitted by the customer, which makes it pending again.
const applicationSchema = new mongoose.Schema(
  {
    ref: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    service: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    status: {
      type: String,
      enum: ["pending", "forwarded", "approved", "rejected"],
      default: "pending",
    },
    rejectedBy: { type: String, enum: ["admin", "officer", null], default: null },
    rejectionReason: { type: String, default: "" },
    linkedRecord: { type: mongoose.Schema.Types.ObjectId, ref: "CitizenRecord", default: null },
    decidedAt: { type: Date, default: null },
    history: { type: [historySchema], default: [] },
  },
  { timestamps: true, minimize: false }
);

module.exports = mongoose.model("Application", applicationSchema);
