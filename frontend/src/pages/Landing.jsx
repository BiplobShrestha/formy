import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useAuth, homePathFor } from "../context/AuthContext.jsx";
import NoticePopup from "../components/NoticePopup.jsx";

const steps = [
  "Create an account with your name, phone number and a password.",
  "Log in, open Forms and choose the service you need (citizenship, passport or relationship verification).",
  "Fill in the form and upload clear photos of your documents. We shrink the photos for you.",
  "Track your application on your dashboard. It starts as Pending, then goes to the government officer.",
  "When a decision is made, download your decision letter as a PDF. If it is rejected, the reason is written in it and you can edit and resubmit.",
];

export default function Landing() {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    api("/api/notices")
      .then((d) => setNotices(d.notices))
      .catch(() => {});
  }, []);

  return (
    <div className="page">
      <NoticePopup />

      <h1>Formy</h1>
      <p>Apply for government services online, without visiting the office in person.</p>

      {user ? (
        <Link to={homePathFor(user.role)}><button>Go to dashboard</button></Link>
      ) : (
        <div className="row">
          <Link to="/register"><button>Get started</button></Link>
          <Link to="/login"><button>Login</button></Link>
        </div>
      )}

      <h2>How it works</h2>
      <ol>
        {steps.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>

      <h2>Notices</h2>
      {notices.length === 0 && <p className="muted">No notices right now.</p>}
      {notices.map((n) => (
        <div key={n._id} className="notice">
          <strong>{n.title}</strong>
          <p>{n.body}</p>
        </div>
      ))}
    </div>
  );
}
