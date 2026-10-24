import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, homePathFor } from "../context/AuthContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const user = await register(name.trim(), phone.trim(), password);
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
        <h1>Create an account</h1>
        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
          </div>
          <div className="field">
            <label htmlFor="phone">Phone number</label>
            <input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="numeric" autoComplete="username" required />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required />
          </div>
          {error && <div className="box box-bad">{error}</div>}
          <button className="big" disabled={busy}>{busy ? "Creating account..." : "Create account"}</button>
        </form>
        <p style={{ marginTop: 20, marginBottom: 0 }}>Already registered? <Link to="/login">Log in</Link></p>
      </div>
    </div>
  );
}
