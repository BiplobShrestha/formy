import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, downloadFile } from "../api.js";
import { useLoad } from "../hooks.js";
import ApplicationView from "../components/ApplicationView.jsx";

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
    <div className="page">
      <p>
        <Link to="/dashboard">Back to my applications</Link>
      </p>
      {loading && <p className="muted">Loading...</p>}
      {error && <p className="error">{error}</p>}
      {data && (
        <>
          <div className="row">
            {(data.application.status === "approved" || data.application.status === "rejected") && (
              <button onClick={download}>Download decision letter (PDF)</button>
            )}
            {data.application.status === "rejected" && (
              <Link to={`/applications/${id}/edit`}>
                <button>Edit and resubmit</button>
              </Link>
            )}
          </div>
          {dlError && <p className="error">{dlError}</p>}
          <ApplicationView application={data.application} service={data.service} />
        </>
      )}
    </div>
  );
}
