import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useLoad } from "../hooks.js";
import ApplicationList from "../components/ApplicationList.jsx";
import StatCards from "../components/StatCards.jsx";

const TABS = [
  ["pending", "Pending"],
  ["forwarded", "With officer"],
  ["approved", "Approved"],
  ["rejected", "Rejected"],
  ["all", "All"],
];

export default function AdminDashboard() {
  const [tab, setTab] = useState("pending");
  const { data, error, loading } = useLoad(
    () => api(`/api/admin/applications${tab === "all" ? "" : `?status=${tab}`}`),
    [tab]
  );

  return (
    <div className="page wide">
      <div className="page-head">
        <div>
          <h1>Admin</h1>
        </div>
        <Link className="btn secondary" to="/admin/notices">Manage notices</Link>
      </div>

      {data && (
        <StatCards
          items={[
            { label: "Waiting for you", value: data.counts.pending, tone: "pending" },
            { label: "With officer", value: data.counts.forwarded, tone: "forwarded" },
            { label: "Approved", value: data.counts.approved, tone: "approved" },
            { label: "Rejected", value: data.counts.rejected, tone: "rejected" },
          ]}
        />
      )}

      <div className="tabs">
        {TABS.map(([key, label]) => (
          <button key={key} className={tab === key ? "tab active" : "tab"} onClick={() => setTab(key)}>
            {label}
            {data && data.counts ? ` (${data.counts[key]})` : ""}
          </button>
        ))}
      </div>
      {loading && <p className="muted">Loading...</p>}
      {error && <div className="box box-bad">{error}</div>}
      {data && (
        <ApplicationList
          applications={data.applications}
          basePath="/admin/applications"
          showApplicant
          empty={<p className="muted" style={{ margin: 0 }}>No applications in this list.</p>}
        />
      )}
    </div>
  );
}
