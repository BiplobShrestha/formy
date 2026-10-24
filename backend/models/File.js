const mongoose = require("mongoose");

// Uploaded images are stored in MongoDB so no extra service is needed.
// The frontend shrinks every image before upload, so each file stays small.
const fileSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    data: { type: Buffer, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("File", fileSchema);
