import { useState } from "react";
import { API } from "../api.js";

// A public notice: a picture, or a title with text.
// A picture that fails to load is retried a few times, then `onFail` lets the popup skip it.
export default function NoticeCard({ notice, inModal = false, onFail }) {
  const [attempt, setAttempt] = useState(0);

  if (notice.hasImage) {
    const src = `${API}/api/notices/${notice._id}/image${attempt ? `?r=${attempt}` : ""}`;
    const failed = () => {
      if (attempt < 3) setTimeout(() => setAttempt((a) => a + 1), 1200);
      else if (onFail) onFail();
    };
    return <img className="notice-img" src={src} alt={notice.title} onError={failed} />;
  }
  return inModal ? (
    <>
      <h2>{notice.title}</h2>
      <p className="notice-text">{notice.body}</p>
    </>
  ) : (
    <div className="notice">
      <strong>{notice.title}</strong>
      <p>{notice.body}</p>
    </div>
  );
}
