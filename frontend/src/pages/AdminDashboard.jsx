import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useLoad } from "../hooks.js";
import ApplicationList from "../components/ApplicationList.jsx";

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
      <div className="row between">
        <h1>Admin</h1>
        <Link to="/admin/notices">
          <button>Manage notices</button>
        </Link>
      </div>
      <div className="tabs">
        {TABS.map(([key, label]) => (
          <button key={key} className={tab === key ? "tab active" : "tab"} onClick={() => setTab(key)}>
            {label}
            {data && data.counts ? ` (${data.counts[key]})` : ""}
          </button>
        ))}
      </div>
      {loading && <p className="muted">Loading...</p>}
      {error && <p className="error">{error}</p>}
      {data && <ApplicationList applications={data.applications} basePath="/admin/applications" showApplicant />}
    </div>
  );
}
