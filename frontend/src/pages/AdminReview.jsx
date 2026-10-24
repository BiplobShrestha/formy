import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, downloadFile } from "../api.js";
import { useLoad } from "../hooks.js";
import ApplicationView, { History } from "../components/ApplicationView.jsx";
import RecordCompare from "../components/RecordCompare.jsx";
import DocChecks from "../components/DocChecks.jsx";
import Tracker from "../components/Tracker.jsx";

const PRESETS = [
  "Name does not match the records.",
  "Phone number does not match the records.",
  "Date of birth does not match the records.",
  "Parents' names do not match the records.",
  "Citizenship photo is too blurry to read.",
  "A parent's citizenship photo does not match the record.",
  "The parent could not be found in the records.",
  "A required document is missing or incorrect.",
];

export default function AdminReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, error, loading, reload } = useLoad(() => api(`/api/applications/${id}`), [id]);

  const [q, setQ] = useState("");
  const [results, setResults] = useState(null);
  const [note, setNote] = useState("");
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState([]);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function act(fn) {
    setMsg("");
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  }

  const search = (e) => {
    e.preventDefault();
    act(async () => {
      const r = await api(`/api/admin/records?q=${encodeURIComponent(q)}`);
      setResults(r.records);
    });
  };

  const pickRecord = (recordId) =>
    act(async () => {
      await api(`/api/admin/applications/${id}/record`, { method: "PUT", body: { recordId } });
      setResults(null);
      setConfirmed([]);
      await reload();
    });

  const forward = () =>
    act(async () => {
      await api(`/api/admin/applications/${id}/forward`, { method: "POST", body: { note, confirmed } });
      navigate("/admin");
    });

  const reject = () =>
    act(async () => {
      await api(`/api/admin/applications/${id}/reject`, { method: "POST", body: { reason } });
      navigate("/admin");
    });

  const previewLetter = () =>
    act(() => downloadFile(`/api/applications/${id}/letter?type=officer`, `${data.application.ref}-officer-letter.pdf`));

  const toggle = (key) => setConfirmed((c) => (c.includes(key) ? c.filter((k) => k !== key) : [...c, key]));
  const checks = data && data.match ? data.match.docChecks || [] : [];
  const allChecked = checks.every((c) => c.record && !c.problem && confirmed.includes(c.key));

  const pending = data && data.application.status === "pending";
  const mismatch = data && data.match && data.match.record && data.match.level !== "full";

  return (
    <div className="page wide">
      <Link className="back" to="/admin">Back to applications</Link>
      {loading && <p className="muted">Loading...</p>}
      {error && <div className="box box-bad">{error}</div>}

      {data && (
        <div className="split">
          <div className="stack">
            <div className="panel">
              <ApplicationView application={data.application} service={data.service} />
            </div>
            <div className="panel">
              <h3>History</h3>
              <History application={data.application} />
            </div>
          </div>

          <div className="stack sticky">
            <div className="panel">
              <h3>Progress</h3>
              <Tracker status={data.application.status} rejectedBy={data.application.rejectedBy} />
            </div>

            <div className="panel">
              <h2>Citizen record</h2>
              <RecordCompare match={data.match} />

              {pending && (
                <>
                  <h3 className="section">Search the records</h3>
                  <form onSubmit={search} className="search-row">
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Name, phone or citizenship number"
                      aria-label="Search the records"
                    />
                    <button className="secondary" disabled={busy}>Search</button>
                  </form>
                  {results && results.length === 0 && <p className="muted" style={{ marginTop: 8 }}>No records found.</p>}
                  {results && results.length > 0 && (
                    <div className="table-wrap" style={{ marginTop: 10 }}>
                      <table>
                        <tbody>
                          {results.map((r) => (
                            <tr key={r.id}>
                              <td>
                                {r.fullName}
                                <div className="muted">
                                  {r.phone} | {r.citizenshipNumber}
                                </div>
                              </td>
                              <td style={{ textAlign: "right" }}>
                                <button className="secondary" onClick={() => pickRecord(r.id)} disabled={busy}>
                                  Use this record
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>

            {checks.length > 0 && (
              <div className="panel">
                <h2>Document checks</h2>
                <DocChecks checks={checks} application={data.application} confirmed={confirmed} onToggle={pending ? toggle : undefined} />
              </div>
            )}

            {pending && (
              <div className="panel">
                <h2>Decision</h2>
                {mismatch && <div className="box box-warn">Some details do not match. Check them before you forward.</div>}

                <div className="field">
                  <label htmlFor="note">Note for the officer (optional)</label>
                  <input id="note" value={note} onChange={(e) => setNote(e.target.value)} />
                </div>
                <div className="row">
                  <button onClick={forward} disabled={busy || !data.match.record || !allChecked}>
                    Verify and forward to officer
                  </button>
                  <button className="secondary" onClick={previewLetter} disabled={busy}>
                    Preview officer letter (PDF)
                  </button>
                </div>

                <h3 className="section">Or reject with a reason</h3>
                <div className="chips">
                  {PRESETS.map((p) => (
                    <button key={p} type="button" className="chip" onClick={() => setReason((r) => (r ? `${r} ${p}` : p))}>
                      {p}
                    </button>
                  ))}
                </div>
                <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason shown to the customer" aria-label="Reason for rejection" />
                <div style={{ marginTop: 10 }}>
                  <button className="danger" onClick={reject} disabled={busy || reason.trim().length < 5}>
                    Reject application
                  </button>
                </div>
              </div>
            )}

            {!pending && (
              <div className="panel">
                <h3>Letters</h3>
                <div className="row">
                  <button className="secondary" onClick={previewLetter} disabled={busy}>
                    Download officer letter (PDF)
                  </button>
                  {(data.application.status === "approved" || data.application.status === "rejected") && (
                    <button
                      className="secondary"
                      onClick={() =>
                        act(() => downloadFile(`/api/applications/${id}/letter?type=customer`, `${data.application.ref}-letter.pdf`))
                      }
                    >
                      Download customer letter (PDF)
                    </button>
                  )}
                </div>
              </div>
            )}
            {msg && <div className="box box-bad">{msg}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
