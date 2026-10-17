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
    <div className="page narrow">
      <h1>Register</h1>
      <form onSubmit={submit}>
        <label>Full name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required />
        <label>Phone number</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="numeric" required />
        <label>Password (at least 6 characters)</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="error">{error}</p>}
        <button disabled={busy}>{busy ? "Creating account..." : "Create account"}</button>
      </form>
      {busy && <p className="muted">The first request can take up to a minute while the server wakes up.</p>}
      <p>Already registered? <Link to="/login">Login</Link></p>
    </div>
  );
}
