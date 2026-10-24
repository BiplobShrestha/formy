const mongoose = require("mongoose");

const citizenRecordSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    citizenshipNumber: { type: String, required: true, unique: true, trim: true },
    issueDistrict: { type: String, required: true, trim: true },
    dob: { type: String, required: true }, // YYYY-MM-DD
    fatherName: { type: String, required: true, trim: true },
    motherName: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    // Links to the records of this person's parents (by citizenship number)
    fatherCitizenshipNumber: { type: String, default: "", trim: true },
    motherCitizenshipNumber: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CitizenRecord", citizenRecordSchema);
