import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, homePathFor } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const user = await login(phone.trim(), password);
      navigate(homePathFor(user.role));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth">
      <div className="panel">
        <h1>Log in</h1>
        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="phone">Phone number</label>
            <input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="numeric" autoComplete="username" required />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
          </div>
          {error && <div className="box box-bad">{error}</div>}
          <button className="big" disabled={busy}>{busy ? "Logging in..." : "Log in"}</button>
        </form>
        {busy && <p className="muted" style={{ marginTop: 12 }}>The first request can take up to a minute while the server wakes up.</p>}
        <p style={{ marginTop: 20, marginBottom: 0 }}>New here? <Link to="/register">Create an account</Link></p>
      </div>
    </div>
  );
}
