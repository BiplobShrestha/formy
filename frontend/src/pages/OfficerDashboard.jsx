import { useState } from "react";
import { api } from "../api.js";
import { useLoad } from "../hooks.js";
import ApplicationList from "../components/ApplicationList.jsx";
import StatCards from "../components/StatCards.jsx";

export default function OfficerDashboard() {
  const [tab, setTab] = useState("pending");
  const { data, error, loading } = useLoad(() => api(`/api/officer/applications?tab=${tab}`), [tab]);

  return (
    <div className="page wide">
      <div className="page-head">
        <div>
          <h1>Officer</h1>
        </div>
      </div>
      {data && (
        <StatCards
          items={[
            { label: "Waiting for your decision", value: data.counts.pending, tone: "forwarded" },
            { label: "Decided", value: data.counts.decided, tone: "approved" },
          ]}
        />
      )}
      <div className="tabs">
        <button className={tab === "pending" ? "tab active" : "tab"} onClick={() => setTab("pending")}>
          Pending{data ? ` (${data.counts.pending})` : ""}
        </button>
        <button className={tab === "decided" ? "tab active" : "tab"} onClick={() => setTab("decided")}>
          Decided{data ? ` (${data.counts.decided})` : ""}
        </button>
      </div>
      {loading && <p className="muted">Loading...</p>}
      {error && <div className="box box-bad">{error}</div>}
      {data && (
        <ApplicationList
          applications={data.applications}
          basePath="/officer/applications"
          showApplicant
          empty={<p className="muted" style={{ margin: 0 }}>No applications in this list.</p>}
        />
      )}
    </div>
  );
}
