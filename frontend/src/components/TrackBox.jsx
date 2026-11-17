import { useState } from "react";
import { api } from "../api.js";
import { fmtDateTime } from "../hooks.js";
import StatusBadge from "./StatusBadge.jsx";
import Tracker from "./Tracker.jsx";

// Public lookup by reference number. Shows only the service and the status.
export default function TrackBox() {
  const [ref, setRef] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    const value = ref.trim();
    if (!value) return;
    setBusy(true);
    setError("");
    try {
      const d = await api(`/api/track/${encodeURIComponent(value)}`);
      setResult(d.application);
    } catch (err) {
      setResult(null);
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="track">
      <form className="search-row" onSubmit={submit}>
        <input
          id="trackref"
          aria-label="Reference number"
          placeholder="FRM-20261021-A3F2"
          value={ref}
          onChange={(e) => setRef(e.target.value)}
        />
        <button disabled={busy || !ref.trim()}>{busy ? "Checking..." : "Track"}</button>
      </form>
      {error && <div className="box box-bad">{error}</div>}
      {result && (
        <div className="ticket track-result">
          <div className="ticket-top">
            <div>
              <strong>{result.serviceTitle}</strong>
              <div className="muted">Reference {result.ref}</div>
              <div className="muted">Last updated {fmtDateTime(result.updatedAt)}</div>
            </div>
            <StatusBadge status={result.status} />
          </div>
          <Tracker status={result.status} rejectedBy={result.rejectedBy} />
        </div>
      )}
    </div>
  );
}
