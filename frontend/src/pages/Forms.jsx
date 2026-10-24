import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useLoad } from "../hooks.js";
import Icon from "../components/Icon.jsx";

const ICONS = { citizenship: "id", passport: "book", relationship: "users" };

export default function Forms() {
  const { data, error, loading } = useLoad(() => api("/api/services"));
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Forms</h1>
          <p>Choose the service you need.</p>
        </div>
      </div>
      {loading && <p className="muted">Loading...</p>}
      {error && <div className="box box-bad">{error}</div>}
      {data &&
        data.services.map((s) => {
          const docs = s.fields.filter((f) => f.type === "file" && !f.showIf).map((f) => f.label);
          return (
            <div key={s.key} className="card">
              <div className="service-row" style={{ padding: 0, border: 0 }}>
                <div className="service-icon"><Icon name={ICONS[s.key] || "file"} /></div>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.description}</p>
                  <p className="muted" style={{ marginBottom: 4 }}>You will need:</p>
                  <ul className="docs">
                    {docs.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                </div>
                <div className="service-cta">
                  <Link className="btn" to={`/forms/${s.key}`}>Apply</Link>
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
}
