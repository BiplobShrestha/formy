import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, downloadFile } from "../api.js";
import { useLoad } from "../hooks.js";
import ApplicationView from "../components/ApplicationView.jsx";
import RecordCompare from "../components/RecordCompare.jsx";

const PRESETS = [
  "Name does not match the records.",
  "Phone number does not match the records.",
  "Date of birth does not match the records.",
  "Parents' names do not match the records.",
  "Citizenship photo is too blurry to read.",
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
      await reload();
    });

  const forward = () =>
    act(async () => {
      await api(`/api/admin/applications/${id}/forward`, { method: "POST", body: { note } });
      navigate("/admin");
    });

  const reject = () =>
    act(async () => {
      await api(`/api/admin/applications/${id}/reject`, { method: "POST", body: { reason } });
      navigate("/admin");
    });

  const previewLetter = () =>
    act(() => downloadFile(`/api/applications/${id}/letter?type=officer`, `${data.application.ref}-officer-letter.pdf`));

  const pending = data && data.application.status === "pending";
  const mismatch = data && data.match && data.match.record && data.match.level !== "full";

  return (
    <div className="page wide">
      <p>
        <Link to="/admin">Back to applications</Link>
      </p>
      {loading && <p className="muted">Loading...</p>}
      {error && <p className="error">{error}</p>}

      {data && (
        <div className="split">
          <div>
            <ApplicationView application={data.application} service={data.service} />
          </div>

          <div>
            <h2>Citizen record</h2>
            <RecordCompare match={data.match} />

            {pending && (
              <>
                <h3 className="section">Search the records</h3>
                <form onSubmit={search} className="row">
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Name, phone or citizenship number"
                    style={{ flex: 1 }}
                  />
                  <button disabled={busy}>Search</button>
                </form>
                {results && results.length === 0 && <p className="muted">No records found.</p>}
                {results && results.length > 0 && (
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
                          <td>
                            <button onClick={() => pickRecord(r.id)} disabled={busy}>
                              Use this record
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                <h3 className="section">Decision</h3>
                {mismatch && <p className="box box-warn">Some details do not match. Check them before forwarding.</p>}
                <label>Note for the officer (optional)</label>
                <input value={note} onChange={(e) => setNote(e.target.value)} />
                <div className="row" style={{ marginTop: 8 }}>
                  <button onClick={forward} disabled={busy || !data.match.record}>
                    Verify and forward to officer
                  </button>
                  <button onClick={previewLetter} disabled={busy}>
                    Preview officer letter (PDF)
                  </button>
                </div>

                <label style={{ marginTop: 16 }}>Or reject with a reason</label>
                <div className="chips">
                  {PRESETS.map((p) => (
                    <button key={p} type="button" className="chip" onClick={() => setReason((r) => (r ? `${r} ${p}` : p))}>
                      {p}
                    </button>
                  ))}
                </div>
                <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason shown to the customer" />
                <button className="danger" onClick={reject} disabled={busy || reason.trim().length < 5}>
                  Reject application
                </button>
              </>
            )}

            {!pending && (
              <div style={{ marginTop: 16 }}>
                <button onClick={previewLetter} disabled={busy}>
                  Download officer letter (PDF)
                </button>
                {(data.application.status === "approved" || data.application.status === "rejected") && (
                  <button
                    style={{ marginLeft: 8 }}
                    onClick={() =>
                      act(() => downloadFile(`/api/applications/${id}/letter?type=customer`, `${data.application.ref}-letter.pdf`))
                    }
                  >
                    Download customer letter (PDF)
                  </button>
                )}
              </div>
            )}
            {msg && <p className="error">{msg}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
