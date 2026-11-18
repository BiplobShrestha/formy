import { useEffect, useState } from "react";
import { api } from "../api.js";
import NoticeCard from "./NoticeCard.jsx";

// Shows the active notices one at a time. The next one appears after the visitor closes the one before.
// Once all are closed it stays away for the rest of the browser session.
export default function NoticePopup() {
  const [notices, setNotices] = useState([]);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = !!sessionStorage.getItem("formy_notices_seen");
    } catch (e) {
      seen = false;
    }
    if (seen) return;
    api("/api/notices")
      .then((d) => {
        if (d.notices.length) {
          setNotices(d.notices);
          setOpen(true);
        }
      })
      .catch(() => {});
  }, []);

  // a picture that never loads is skipped so the visitor never sees a broken box
  function skip() {
    if (index + 1 < notices.length) {
      setIndex(index + 1);
      return;
    }
    close();
  }

  function close() {
    if (index + 1 < notices.length) {
      setIndex(index + 1);
      return;
    }
    try {
      sessionStorage.setItem("formy_notices_seen", "1");
    } catch (e) {
      /* the popup may show again, which is fine */
    }
    setOpen(false);
  }

  if (!open) return null;
  const n = notices[index];

  return (
    <div className="overlay">
      <div className={n.hasImage ? "modal modal-image" : "modal"} role="dialog" aria-modal="true">
        <NoticeCard key={n._id} notice={n} inModal onFail={skip} />
        <button onClick={close}>Close</button>
      </div>
    </div>
  );
}
