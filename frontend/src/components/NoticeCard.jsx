import { API } from "../api.js";

// A public notice: a picture, or a title with text.
export default function NoticeCard({ notice, inModal = false }) {
  if (notice.hasImage) {
    return <img className="notice-img" src={`${API}/api/notices/${notice._id}/image`} alt={notice.title} />;
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
