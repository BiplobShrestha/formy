import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useLoad } from "../hooks.js";
import ApplicationList from "../components/ApplicationList.jsx";
import StatCards from "../components/StatCards.jsx";

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { data, error, loading } = useLoad(() => api("/api/applications/mine"));
  const apps = data ? data.applications : [];
  const count = (...s) => apps.filter((a) => s.includes(a.status)).length;

  return (
    <div className="page wide">
      <div className="page-head">
        <div>
          <h1>Welcome, {user.name}</h1>
        </div>
        <Link className="btn" to="/forms">New application</Link>
      </div>

      {data && apps.length > 0 && (
        <StatCards
          items={[
            { label: "Applications", value: apps.length },
            { label: "In progress", value: count("pending", "forwarded"), tone: "pending" },
            { label: "Approved", value: count("approved"), tone: "approved" },
            { label: "Need your action", value: count("rejected"), tone: "rejected" },
          ]}
        />
      )}

      {loading && <p className="muted">Loading...</p>}
      {error && <div className="box box-bad">{error}</div>}
      {data && (
        <ApplicationList
          applications={apps}
          basePath="/applications"
          empty={
            <>
              <h3>You have not applied yet</h3>
              <Link className="btn" to="/forms">Choose a service</Link>
            </>
          }
        />
      )}
    </div>
  );
}
