import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useLoad } from "../hooks.js";

export default function Forms() {
  const { data, error, loading } = useLoad(() => api("/api/services"));
  return (
    <div className="page">
      <h1>Forms</h1>
      <p>Choose the service you need.</p>
      {loading && <p className="muted">Loading...</p>}
      {error && <p className="error">{error}</p>}
      {data &&
        data.services.map((s) => (
          <div key={s.key} className="card">
            <h3 style={{ margin: "0 0 4px" }}>{s.title}</h3>
            <p style={{ margin: "0 0 8px" }}>{s.description}</p>
            <Link to={`/forms/${s.key}`}>
              <button>Apply</button>
            </Link>
          </div>
        ))}
    </div>
  );
}
