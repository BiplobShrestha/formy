const mongoose = require("mongoose");
const File = require("../models/File");

const PHONE_RE = /^9[78]\d{8}$/;

function isVisible(field, data) {
  if (!field.showIf) return true;
  return data[field.showIf.field] === field.showIf.equals;
}

function ageInYears(dobStr) {
  const dob = new Date(dobStr);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
  return age;
}

// Checks the submitted data against the service definition.
// Returns { errors: {fieldName: message}, clean: {fieldName: value} }
async function validateApplicationData(service, rawData, userId) {
  const errors = {};
  const clean = {};
  const data = rawData && typeof rawData === "object" ? rawData : {};

  for (const f of service.fields) {
    if (!isVisible(f, data)) continue;

    let v = data[f.name];
    if (typeof v === "string") v = v.trim();
    const empty = v === undefined || v === null || v === "";

    if (empty) {
      if (f.required !== false) errors[f.name] = `${f.label} is required`;
      continue;
    }

    if (f.type === "text" || f.type === "textarea") {
      if (String(v).length > 300) errors[f.name] = `${f.label} is too long`;
    } else if (f.type === "number") {
      const n = Number(v);
      if (!Number.isInteger(n)) errors[f.name] = `${f.label} must be a whole number`;
      else if (f.min !== undefined && n < f.min) errors[f.name] = `${f.label} must be at least ${f.min}`;
      else if (f.max !== undefined && n > f.max) errors[f.name] = `${f.label} must be at most ${f.max}`;
      else v = n;
    } else if (f.type === "date") {
      const d = new Date(v);
      if (Number.isNaN(d.getTime())) errors[f.name] = `${f.label} is not a valid date`;
      else if (d > new Date()) errors[f.name] = `${f.label} cannot be in the future`;
      else if (f.minAge && ageInYears(v) < f.minAge) errors[f.name] = `You must be at least ${f.minAge} years old to apply`;
    } else if (f.type === "phone") {
      if (!PHONE_RE.test(String(v))) errors[f.name] = `${f.label} must be 10 digits starting with 97 or 98`;
    } else if (f.type === "select") {
      if (!f.options.includes(v)) errors[f.name] = `Choose a valid option for ${f.label}`;
    } else if (f.type === "file") {
      if (!mongoose.isValidObjectId(v)) errors[f.name] = `${f.label}: please upload the file again`;
    }

    clean[f.name] = v;
  }

  // Uploaded files must exist, belong to this user, and respect the size limit
  const fileFields = service.fields.filter((f) => f.type === "file" && clean[f.name] && !errors[f.name]);
  if (fileFields.length) {
    const ids = fileFields.map((f) => clean[f.name]);
    const found = await File.find({ _id: { $in: ids }, owner: userId }, "size mimeType");
    const byId = new Map(found.map((x) => [String(x._id), x]));
    for (const f of fileFields) {
      const file = byId.get(String(clean[f.name]));
      if (!file) errors[f.name] = `${f.label}: file not found, please upload it again`;
      else if (file.size > service.maxFileKB * 1024) {
        errors[f.name] = `${f.label} must be ${service.maxFileKB} KB or smaller`;
      }
    }
  }

  return { errors, clean };
}

module.exports = { validateApplicationData, isVisible, PHONE_RE };
