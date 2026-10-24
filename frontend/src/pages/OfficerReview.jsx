import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, downloadFile } from "../api.js";
import { useLoad } from "../hooks.js";
import ApplicationView, { History } from "../components/ApplicationView.jsx";
import RecordCompare from "../components/RecordCompare.jsx";
import DocChecks from "../components/DocChecks.jsx";
import Tracker from "../components/Tracker.jsx";

export default function OfficerReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, error, loading } = useLoad(() => api(`/api/applications/${id}`), [id]);

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

  const verify = () =>
    act(async () => {
      await api(`/api/officer/applications/${id}/verify`, { method: "POST", body: { note } });
      navigate("/officer");
    });

  const reject = () =>
    act(async () => {
      await api(`/api/officer/applications/${id}/reject`, { method: "POST", body: { reason } });
      navigate("/officer");
    });

  const letter = () =>
    act(() => downloadFile(`/api/applications/${id}/letter?type=officer`, `${data.application.ref}-officer-letter.pdf`));

  const waiting = data && data.application.status === "forwarded";

  return (
    <div className="page wide">
      <Link className="back" to="/officer">Back to applications</Link>
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
            </div>
            {data.match && data.match.docChecks && data.match.docChecks.length > 0 && (
              <div className="panel">
                <h2>Document checks</h2>
                <DocChecks checks={data.match.docChecks} application={data.application} />
              </div>
            )}
            <div className="panel">
              <h3>Letter</h3>
              <button className="secondary" onClick={letter} disabled={busy}>
                Download formal letter with documents (PDF)
              </button>
            </div>

            {waiting && (
              <div className="panel">
                <h2>Your decision</h2>
                <div className="field">
                  <label htmlFor="onote">Note (optional)</label>
                  <input id="onote" value={note} onChange={(e) => setNote(e.target.value)} />
                </div>
                <button onClick={verify} disabled={busy}>Verify (approve)</button>

                <h3 className="section">Or reject with a reason</h3>
                <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason shown to the customer" aria-label="Reason for rejection" />
                <div style={{ marginTop: 10 }}>
                  <button className="danger" onClick={reject} disabled={busy || reason.trim().length < 5}>
                    Reject (falsify)
                  </button>
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
