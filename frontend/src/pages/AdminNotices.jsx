import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, uploadNoticeImage } from "../api.js";
import { compressImage } from "../compress.js";
import { useLoad } from "../hooks.js";
import SecureImage from "../components/SecureImage.jsx";
import FileDrop from "../components/FileDrop.jsx";

export default function AdminNotices() {
  const { data, error, loading, reload } = useLoad(() => api("/api/admin/notices"));
  const [kind, setKind] = useState("text");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageId, setImageId] = useState("");
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  async function run(fn) {
    setMsg("");
    try {
      await fn();
      await reload();
    } catch (e) {
      setMsg(e.message);
    }
  }

  function clearImage() {
    setImageId("");
    setPreview("");
  }

  async function pickImage(file) {
    setMsg("");
    setUploading(true);
    try {
      const small = await compressImage(file, 900 * 1024);
      const { file: saved } = await uploadNoticeImage(small);
      setImageId(saved.id);
      setPreview(URL.createObjectURL(small));
    } catch (err) {
      clearImage();
      setMsg(err.message);
    } finally {
      setUploading(false);
    }
  }

  const add = (e) => {
    e.preventDefault();
    run(async () => {
      const payload = kind === "image" ? { title, imageId } : { title, body };
      await api("/api/admin/notices", { method: "POST", body: payload });
      setTitle("");
      setBody("");
      clearImage();
    });
  };

  const ready = title.trim() && (kind === "text" ? body.trim() : imageId);

  return (
    <div className="page">
      <Link className="back" to="/admin">Back to applications</Link>
      <div className="page-head">
        <div>
          <h1>Notices</h1>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 20 }}>
        <h2>New notice</h2>
        <div className="type-switch" role="group" aria-label="Notice type">
          <button type="button" className={kind === "text" ? "on" : ""} onClick={() => setKind("text")}>Text</button>
          <button type="button" className={kind === "image" ? "on" : ""} onClick={() => setKind("image")}>Image</button>
        </div>
        <form onSubmit={add}>
          <div className="field">
            <label htmlFor="nt">Title</label>
            <input id="nt" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          {kind === "text" ? (
            <div className="field">
              <label htmlFor="nb">Text</label>
              <textarea id="nb" rows={3} value={body} onChange={(e) => setBody(e.target.value)} />
            </div>
          ) : (
            <div className="field">
              <label htmlFor="ni">Image</label>
              <FileDrop id="ni" has={!!imageId} busy={uploading} onFile={pickImage} onRemove={clearImage}>
                {preview && <img className="notice-preview" src={preview} alt="Notice preview" />}
              </FileDrop>
            </div>
          )}
          <div><button disabled={!ready || uploading}>Add notice</button></div>
        </form>
        {msg && <div className="box box-bad">{msg}</div>}
      </div>

      {loading && <p className="muted">Loading...</p>}
      {error && <div className="box box-bad">{error}</div>}
      {data &&
        data.notices.map((n) => (
          <div key={n._id} className="notice">
            <div className="row between">
              <strong>{n.title}</strong>
              <span className={n.active ? "badge badge-approved" : "badge badge-pending"}>{n.active ? "Active" : "Hidden"}</span>
            </div>
            {n.image ? <div style={{ margin: "8px 0" }}><SecureImage fileId={n.image} alt={n.title} /></div> : <p>{n.body}</p>}
            <div className="row">
              <button className="secondary" onClick={() => run(() => api(`/api/admin/notices/${n._id}`, { method: "PUT", body: { active: !n.active } }))}>
                {n.active ? "Hide" : "Show"}
              </button>
              <button
                className="secondary"
                onClick={() => window.confirm("Delete this notice?") && run(() => api(`/api/admin/notices/${n._id}`, { method: "DELETE" }))}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
    </div>
  );
}
