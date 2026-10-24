import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useLoad } from "../hooks.js";

export default function AdminNotices() {
  const { data, error, loading, reload } = useLoad(() => api("/api/admin/notices"));
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [msg, setMsg] = useState("");

  async function run(fn) {
    setMsg("");
    try {
      await fn();
      await reload();
    } catch (e) {
      setMsg(e.message);
    }
  }

  const add = (e) => {
    e.preventDefault();
    run(async () => {
      await api("/api/admin/notices", { method: "POST", body: { title, body } });
      setTitle("");
      setBody("");
    });
  };

  return (
    <div className="page">
      <p>
        <Link to="/admin">Back to applications</Link>
      </p>
      <h1>Notices</h1>
      <p className="muted">Active notices show in a popup and on the landing page.</p>

      <form onSubmit={add}>
        <label>Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        <label>Text</label>
        <textarea rows={3} value={body} onChange={(e) => setBody(e.target.value)} required />
        <button>Add notice</button>
      </form>
      {msg && <p className="error">{msg}</p>}

      {loading && <p className="muted">Loading...</p>}
      {error && <p className="error">{error}</p>}
      {data &&
        data.notices.map((n) => (
          <div key={n._id} className="notice">
            <div className="row between">
              <strong>{n.title}</strong>
              <span className={n.active ? "badge badge-approved" : "badge badge-rejected"}>{n.active ? "Active" : "Hidden"}</span>
            </div>
            <p>{n.body}</p>
            <div className="row">
              <button onClick={() => run(() => api(`/api/admin/notices/${n._id}`, { method: "PUT", body: { active: !n.active } }))}>
                {n.active ? "Hide" : "Show"}
              </button>
              <button
                className="danger"
                onClick={() => window.confirm("Delete this notice?") && run(() => api(`/api/admin/notices/${n._id}`, { method: "DELETE" }))}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
    </div>
  );
}
