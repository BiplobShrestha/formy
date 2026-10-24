import { useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Account() {
  const { user } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [again, setAgain] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setDone(false);
    if (next !== again) return setError("The two new passwords are not the same");
    setBusy(true);
    try {
      await api("/api/auth/password", { method: "PUT", body: { currentPassword: current, newPassword: next } });
      setDone(true);
      setCurrent("");
      setNext("");
      setAgain("");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page narrow" style={{ maxWidth: 560 }}>
      <div className="page-head">
        <h1>Account</h1>
      </div>
      <div className="panel" style={{ marginBottom: 20 }}>
        <div className="detail"><span className="detail-label">Name</span><span className="detail-value">{user.name}</span></div>
        <div className="detail"><span className="detail-label">Phone number</span><span className="detail-value">{user.phone}</span></div>
        <div className="detail" style={{ borderBottom: 0 }}><span className="detail-label">Role</span><span className="detail-value">{user.role}</span></div>
      </div>

      <div className="panel">
        <h2>Change password</h2>
        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="cur">Current password</label>
            <input id="cur" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" required />
          </div>
          <div className="field">
            <label htmlFor="new">New password</label>
            <input id="new" type="password" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" required />
            <span className="muted">At least 6 characters.</span>
          </div>
          <div className="field">
            <label htmlFor="again">New password again</label>
            <input id="again" type="password" value={again} onChange={(e) => setAgain(e.target.value)} autoComplete="new-password" required />
          </div>
          {error && <div className="box box-bad">{error}</div>}
          {done && <div className="box box-good">Password changed.</div>}
          <button disabled={busy}>{busy ? "Saving..." : "Save new password"}</button>
        </form>
      </div>
    </div>
  );
}
