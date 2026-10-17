import { useEffect, useState } from "react";
import { api } from "../api.js";

// Shows active notices once per browser session, with a close button.
export default function NoticePopup() {
  const [notices, setNotices] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("formy_notices_seen")) return;
    api("/api/notices")
      .then((d) => {
        if (d.notices.length) {
          setNotices(d.notices);
          setOpen(true);
        }
      })
      .catch(() => {});
  }, []);

  function close() {
    sessionStorage.setItem("formy_notices_seen", "1");
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="overlay">
      <div className="modal">
        <h2>Notices</h2>
        {notices.map((n) => (
          <div key={n._id} className="notice">
            <strong>{n.title}</strong>
            <p>{n.body}</p>
          </div>
        ))}
        <button onClick={close}>Close</button>
      </div>
    </div>
  );
}
