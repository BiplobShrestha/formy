import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, downloadFile } from "../api.js";
import { useLoad } from "../hooks.js";
import ApplicationView, { History } from "../components/ApplicationView.jsx";
import Tracker from "../components/Tracker.jsx";

export default function ApplicationDetail() {
  const { id } = useParams();
  const { data, error, loading } = useLoad(() => api(`/api/applications/${id}`), [id]);
  const [dlError, setDlError] = useState("");

  async function download() {
    setDlError("");
    try {
      await downloadFile(`/api/applications/${id}/letter?type=customer`, `${data.application.ref}-letter.pdf`);
    } catch (e) {
      setDlError(e.message);
    }
  }

  return (
    <div className="page wide">
      <Link className="back" to="/dashboard">Back to my applications</Link>
      {loading && <p className="muted">Loading...</p>}
      {error && <div className="box box-bad">{error}</div>}
      {data && (
        <div className="split-main">
          <div className="panel">
            <ApplicationView application={data.application} service={data.service} />
          </div>

          <aside className="sticky stack">
            <div className="panel">
              <h3>Progress</h3>
              <Tracker status={data.application.status} rejectedBy={data.application.rejectedBy} />
              <div className="stack" style={{ marginTop: 20 }}>
                {(data.application.status === "approved" || data.application.status === "rejected") && (
                  <button onClick={download}>Download decision letter (PDF)</button>
                )}
                {data.application.status === "rejected" && (
                  <Link className="btn" to={`/applications/${id}/edit`}>Edit and resubmit</Link>
                )}
                {dlError && <div className="box box-bad">{dlError}</div>}
              </div>
            </div>
            <div className="panel">
              <h3>History</h3>
              <History application={data.application} />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
