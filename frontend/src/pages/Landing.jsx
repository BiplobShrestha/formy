import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useAuth, homePathFor } from "../context/AuthContext.jsx";
import NoticePopup from "../components/NoticePopup.jsx";
import PhotoSlot from "../components/PhotoSlot.jsx";
import Tracker from "../components/Tracker.jsx";
import Icon from "../components/Icon.jsx";
import StatusBadge from "../components/StatusBadge.jsx";

const steps = [
  "Create an account with your name, phone number and a password.",
  "Log in, open Forms and choose the service you need.",
  "Fill in the form and upload clear photos of your documents.",
  "Track your application on your dashboard. It starts as Pending, then goes to the government officer.",
  "When a decision is made, download your decision letter as a PDF. If it is rejected, the reason is written in it and you can edit and resubmit.",
];

const faqs = [
  ["What documents do I upload?", "Each service lists what it needs before you start. Take clear photos of the originals in good light. JPG and PNG both work."],
  ["What happens if my application is rejected?", "The letter says why, for example a name that does not match the records or a blurry photo. Open the application, fix it, and choose Edit and resubmit."],
  ["Who can see my documents?", "You, the Formy admin who checks your application, and the government officer who receives it."],
  ["What happens after it is approved?", "You can download a decision letter. The officer contacts you on the phone number you registered with."],
];

const ICONS = { citizenship: "id", passport: "book", relationship: "users" };

export default function Landing() {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [services, setServices] = useState([]);

  useEffect(() => {
    api("/api/notices").then((d) => setNotices(d.notices)).catch(() => {});
    api("/api/services").then((d) => setServices(d.services)).catch(() => {});
  }, []);

  const startLink = (key) => (user ? (user.role === "customer" ? `/forms/${key}` : homePathFor(user.role)) : "/register");

  return (
    <div>
      <NoticePopup />

      <section className="hero">
        <div className="hero-inner">
          <div>
            <h1>Apply for government services from home</h1>
            <p className="hero-lead">
              Fill in one form, upload your documents, and follow your application until the decision letter is ready.
            </p>
            {user ? (
              <Link className="btn big" to={homePathFor(user.role)}>Go to my dashboard</Link>
            ) : (
              <div className="row">
                <Link className="btn big" to="/register">Create an account</Link>
                <Link className="btn big secondary" to="/login">Log in</Link>
              </div>
            )}
          </div>

          <div className="hero-visual">
            <PhotoSlot name="hero" hint="Photo: a citizen using a phone at home, or at a ward office counter" />
            <div className="ticket" aria-label="Example of an application">
              <div className="ticket-top">
                <div>
                  <strong>Passport application</strong>
                  <div className="muted">Reference FRM-20261021-A3F2</div>
                </div>
                <StatusBadge status="forwarded" />
              </div>
              <Tracker status="forwarded" />
            </div>
          </div>
        </div>
      </section>

      <section className="band" style={{ paddingTop: 80 }}>
        <div className="band-inner">
          <div className="band-head">
            <h2>Services</h2>
            <p>Pick a service to see which documents you need before you start.</p>
          </div>
          <div className="service-list">
            {services.map((s) => {
              const docs = s.fields.filter((f) => f.type === "file" && !f.showIf).map((f) => f.label);
              return (
                <div key={s.key} className="service-row">
                  <div className="service-icon"><Icon name={ICONS[s.key] || "file"} /></div>
                  <div>
                    <h3>{s.title}</h3>
                    <p>{s.description}</p>
                    <ul className="docs">
                      {docs.map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="service-cta">
                    <Link className="btn secondary" to={startLink(s.key)}>{user ? "Apply" : "Get started"}</Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="band band-white">
        <div className="band-inner steps-layout">
          <div>
            <h2>How it works</h2>
            <ol className="steps">
              {steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </div>
          <PhotoSlot name="guide" hint="Photo: a person holding their citizenship certificate and documents" />
        </div>
      </section>

      <section className="band">
        <div className="band-inner">
          <div className="band-head">
            <h2>Notices</h2>
          </div>
          {notices.length === 0 && <p className="muted">No notices right now.</p>}
          <div style={{ maxWidth: 760 }}>
            {notices.map((n) => (
              <div key={n._id} className="notice">
                <strong>{n.title}</strong>
                <p>{n.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="band band-white">
        <div className="band-inner faq">
          <div className="band-head">
            <h2>Common questions</h2>
          </div>
          {faqs.map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
