import { useState } from "react";
import { api } from "../api.js";
import { useLoad } from "../hooks.js";
import ApplicationList from "../components/ApplicationList.jsx";

export default function OfficerDashboard() {
  const [tab, setTab] = useState("pending");
  const { data, error, loading } = useLoad(() => api(`/api/officer/applications?tab=${tab}`), [tab]);

  return (
    <div className="page wide">
      <h1>Officer</h1>
      <div className="tabs">
        <button className={tab === "pending" ? "tab active" : "tab"} onClick={() => setTab("pending")}>
          Pending{data ? ` (${data.counts.pending})` : ""}
        </button>
        <button className={tab === "decided" ? "tab active" : "tab"} onClick={() => setTab("decided")}>
          Decided{data ? ` (${data.counts.decided})` : ""}
        </button>
      </div>
      {loading && <p className="muted">Loading...</p>}
      {error && <p className="error">{error}</p>}
      {data && <ApplicationList applications={data.applications} basePath="/officer/applications" showApplicant />}
    </div>
  );
}
