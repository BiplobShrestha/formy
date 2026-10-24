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
      <Link className="back" to="/admin">Back to applications</Link>
      <div className="page-head">
        <div>
          <h1>Notices</h1>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 20 }}>
        <h2>New notice</h2>
        <form onSubmit={add}>
          <div className="field">
            <label htmlFor="nt">Title</label>
            <input id="nt" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="nb">Text</label>
            <textarea id="nb" rows={3} value={body} onChange={(e) => setBody(e.target.value)} required />
          </div>
          <div><button>Add notice</button></div>
        </form>
        {msg && <div className="box box-bad">{msg}</div>}
      </div>

      {loading && <p className="muted">Loading...</p>}
      {error && <div className="box box-bad">{error}</div>}
      {data &&
        data.notices.map((n) => (
          <div key={n._id} className="notice">
            <div className="row between">
              <strong>{n.title}</strong>
              <span className={n.active ? "badge badge-approved" : "badge badge-pending"}>{n.active ? "Active" : "Hidden"}</span>
            </div>
            <p>{n.body}</p>
            <div className="row">
              <button className="secondary" onClick={() => run(() => api(`/api/admin/notices/${n._id}`, { method: "PUT", body: { active: !n.active } }))}>
                {n.active ? "Hide" : "Show"}
              </button>
              <button
                className="secondary"
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
