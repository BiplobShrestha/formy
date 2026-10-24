import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useLoad } from "../hooks.js";
import ApplicationList from "../components/ApplicationList.jsx";

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { data, error, loading } = useLoad(() => api("/api/applications/mine"));

  return (
    <div className="page">
      <div className="row between">
        <h1>Welcome, {user.name}</h1>
        <Link to="/forms">
          <button>New application</button>
        </Link>
      </div>
      <h2>My applications</h2>
      {loading && <p className="muted">Loading...</p>}
      {error && <p className="error">{error}</p>}
      {data && <ApplicationList applications={data.applications} basePath="/applications" />}
    </div>
  );
}
