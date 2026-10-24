import { useState } from "react";
import { upload } from "../api.js";
import { compressImage } from "../compress.js";
import SecureImage from "./SecureImage.jsx";

const PHONE_RE = /^9[78]\d{8}$/;

function isVisible(f, values) {
  return !f.showIf || values[f.showIf.field] === f.showIf.equals;
}

function ageOf(dob) {
  const d = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

// Builds a form from a service definition sent by the backend
export default function DynamicForm({ service, initial, submitLabel, onSubmit }) {
  const [values, setValues] = useState(initial || {});
  const [errors, setErrors] = useState({});
  const [busyField, setBusyField] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const today = new Date().toISOString().slice(0, 10);

  function setValue(name, v) {
    setValues((p) => ({ ...p, [name]: v }));
    setErrors((p) => ({ ...p, [name]: undefined }));
  }

  async function pickFile(f, e) {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    setBusyField(f.name);
    setErrors((p) => ({ ...p, [f.name]: undefined }));
    try {
      const small = await compressImage(file, service.maxFileKB * 1024);
      const { file: saved } = await upload(small);
      setValue(f.name, saved.id);
    } catch (err) {
      setErrors((p) => ({ ...p, [f.name]: err.message }));
    } finally {
      setBusyField("");
    }
  }

  function clientValidate() {
    const errs = {};
    for (const f of service.fields) {
      if (!isVisible(f, values)) continue;
      const v = typeof values[f.name] === "string" ? values[f.name].trim() : values[f.name];
      if (v === undefined || v === null || v === "") {
        if (f.required !== false) errs[f.name] = `${f.label} is required`;
        continue;
      }
      if (f.type === "phone" && !PHONE_RE.test(String(v))) errs[f.name] = "Enter 10 digits starting with 97 or 98";
      if (f.type === "number") {
        const n = Number(v);
        if (!Number.isInteger(n) || (f.min !== undefined && n < f.min) || (f.max !== undefined && n > f.max)) {
          errs[f.name] = `Enter a number between ${f.min} and ${f.max}`;
        }
      }
      if (f.type === "date") {
        if (new Date(v) > new Date()) errs[f.name] = "Date cannot be in the future";
        else if (f.minAge && ageOf(v) < f.minAge) errs[f.name] = `You must be at least ${f.minAge} years old`;
      }
    }
    return errs;
  }

  async function submit(e) {
    e.preventDefault();
    setFormError("");
    const errs = clientValidate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      setFormError("Please fix the highlighted fields");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSaving(true);
    try {
      await onSubmit(values);
    } catch (err) {
      if (err.errors) setErrors(err.errors);
      setFormError(err.message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      {formError && <p className="error">{formError}</p>}

      {service.fields.map((f) => {
        if (!isVisible(f, values)) return null;
        const err = errors[f.name];
        return (
          <div key={f.name}>
            {f.section && <h3 className="section">{f.section}</h3>}
            <div className="field">
              <label htmlFor={f.name}>{f.label}</label>

              {f.type === "select" ? (
                <select id={f.name} value={values[f.name] || ""} onChange={(e) => setValue(f.name, e.target.value)}>
                  <option value="">Choose...</option>
                  {f.options.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : f.type === "file" ? (
                <div>
                  {values[f.name] && <SecureImage fileId={values[f.name]} alt={f.label} />}
                  <input
                    id={f.name}
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={(e) => pickFile(f, e)}
                    disabled={busyField === f.name}
                  />
                  {busyField === f.name && <span className="muted"> Uploading...</span>}
                  {values[f.name] && busyField !== f.name && <span className="muted"> Uploaded. Choose another file to replace it.</span>}
                </div>
              ) : (
                <input
                  id={f.name}
                  type={f.type === "date" ? "date" : f.type === "number" ? "number" : "text"}
                  inputMode={f.type === "phone" ? "numeric" : undefined}
                  max={f.type === "date" ? today : f.max}
                  min={f.type === "number" ? f.min : undefined}
                  value={values[f.name] ?? ""}
                  onChange={(e) => setValue(f.name, e.target.value)}
                />
              )}

              {f.hint && <span className="muted">{f.hint}</span>}
              {f.type === "file" && <span className="muted">JPG or PNG photo, up to {service.maxFileKB} KB (we shrink it for you)</span>}
              {err && <span className="error">{err}</span>}
            </div>
          </div>
        );
      })}

      <button disabled={saving || !!busyField}>{saving ? "Sending..." : submitLabel}</button>
    </form>
  );
}
