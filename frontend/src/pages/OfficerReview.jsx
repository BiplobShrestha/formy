import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, downloadFile } from "../api.js";
import { useLoad } from "../hooks.js";
import ApplicationView from "../components/ApplicationView.jsx";
import RecordCompare from "../components/RecordCompare.jsx";

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
      <p>
        <Link to="/officer">Back to applications</Link>
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

            <h3 className="section">Letter</h3>
            <button onClick={letter} disabled={busy}>
              Download formal letter with documents (PDF)
            </button>

            {waiting && (
              <>
                <h3 className="section">Your decision</h3>
                <label>Note (optional)</label>
                <input value={note} onChange={(e) => setNote(e.target.value)} />
                <div style={{ marginTop: 8 }}>
                  <button onClick={verify} disabled={busy}>
                    Verify (approve)
                  </button>
                </div>

                <label style={{ marginTop: 16 }}>Or reject with a reason</label>
                <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason shown to the customer" />
                <button className="danger" onClick={reject} disabled={busy || reason.trim().length < 5}>
                  Reject (falsify)
                </button>
              </>
            )}
            {msg && <p className="error">{msg}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
