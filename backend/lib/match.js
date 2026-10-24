const CitizenRecord = require("../models/CitizenRecord");

function norm(s) {
  return String(s ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Finds the record the application most likely belongs to.
// Order: phone number, then citizenship number (passport form), then exact full name.
async function autoFindRecord(data) {
  if (data.phone) {
    const byPhone = await CitizenRecord.findOne({ phone: String(data.phone) });
    if (byPhone) return byPhone;
  }
  if (data.citizenshipNumber) {
    const byCz = await CitizenRecord.findOne({ citizenshipNumber: String(data.citizenshipNumber).trim() });
    if (byCz) return byCz;
  }
  if (data.fullName) {
    const re = new RegExp("^\\s*" + escapeRegex(norm(data.fullName)).replace(/ /g, "\\s+") + "\\s*$", "i");
    const byName = await CitizenRecord.findOne({ fullName: re });
    if (byName) return byName;
  }
  return null;
}

// Side by side comparison rows between the application and a citizen record
function compareWithRecord(data, record) {
  const rows = [
    { label: "Full name", applicant: data.fullName, record: record.fullName },
    { label: "Date of birth", applicant: data.dob, record: record.dob },
    { label: "Phone number", applicant: data.phone, record: record.phone },
    { label: "Father's name", applicant: data.fatherName, record: record.fatherName },
    { label: "Mother's name", applicant: data.motherName, record: record.motherName },
  ];
  if (data.citizenshipNumber) {
    rows.push({ label: "Citizenship number", applicant: data.citizenshipNumber, record: record.citizenshipNumber });
  }
  return rows.map((r) => ({
    ...r,
    applicant: r.applicant ?? "",
    ok: norm(r.applicant) === norm(r.record),
  }));
}

function publicRecord(r) {
  return {
    id: String(r._id),
    fullName: r.fullName,
    phone: r.phone,
    citizenshipNumber: r.citizenshipNumber,
    issueDistrict: r.issueDistrict,
    dob: r.dob,
    fatherName: r.fatherName,
    motherName: r.motherName,
    address: r.address,
  };
}

async function recordByCz(number) {
  const n = String(number || "").trim();
  if (!n) return null;
  return CitizenRecord.findOne({ citizenshipNumber: n });
}

// The documents the admin must check by eye, one block per person.
// Each block pairs the uploaded photos with the stored record of that person.
async function buildDocChecks(serviceKey, data, record, father, mother) {
  const checks = [];
  const add = (key, title, person, fields, rec, extra = {}) =>
    checks.push({
      key,
      title,
      person,
      fields: fields.filter((f) => data[f]),
      record: rec ? publicRecord(rec) : null,
      problem: rec ? null : `No record found for the ${person.toLowerCase()}.`,
      ...extra,
    });

  if (serviceKey === "citizenship") {
    add("father", "Father's citizenship certificate", "Father", ["fatherCitizenshipDoc"], father);
    add("mother", "Mother's citizenship certificate", "Mother", ["motherCitizenshipDoc"], mother);
  } else if (serviceKey === "passport") {
    add("self", "Citizenship certificate", "Applicant", ["citizenshipFrontDoc", "citizenshipBackDoc"], record);
  } else if (serviceKey === "relationship") {
    add("self", "Applicant's citizenship certificate", "Applicant", ["applicantCitizenshipDoc"], record);

    let rel = await recordByCz(data.relativeCitizenshipNumber);
    let problem = null;
    const type = data.relationType;
    if (type === "Father" || type === "Mother") {
      const expected = type === "Father" ? father : mother;
      if (!rel && expected) rel = expected;
      if (rel && (!expected || String(rel._id) !== String(expected._id))) {
        problem = `The records do not show this person as the applicant's ${type.toLowerCase()}.`;
      }
    }
    add("relative", "Relative's citizenship certificate", "Relative", ["relativeCitizenshipDoc"], rel, problem ? { problem } : {});
  }
  return checks;
}

// Builds the match info shown on the review pages.
// `linkedRecordId` is the record the admin picked manually (if any).
async function buildMatch(data, linkedRecordId, serviceKey) {
  let record = null;
  let source = null;

  if (linkedRecordId) {
    record = await CitizenRecord.findById(linkedRecordId);
    if (record) source = "manual";
  }
  if (!record) {
    record = await autoFindRecord(data);
    if (record) source = "auto";
  }
  if (!record) return { record: null, source: null, rows: [], level: "none", docChecks: [] };

  const rows = compareWithRecord(data, record);
  const okCount = rows.filter((r) => r.ok).length;
  const level = okCount === rows.length ? "full" : "partial";

  const father = await recordByCz(record.fatherCitizenshipNumber);
  const mother = await recordByCz(record.motherCitizenshipNumber);
  const docChecks = await buildDocChecks(serviceKey, data, record, father, mother);

  return { record: publicRecord(record), source, rows, level, docChecks };
}

module.exports = { buildMatch, publicRecord, escapeRegex };
