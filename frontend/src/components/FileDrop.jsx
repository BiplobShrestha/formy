import { useState } from "react";

// Upload box: click to choose a photo or drop one on it.
// `has` is true when a photo is already chosen. Then `children` (the preview) and the Replace and Remove buttons show.
export default function FileDrop({ id, has, busy, onFile, onRemove, children }) {
  const [dragging, setDragging] = useState(false);

  function pick(e) {
    const file = e.target.files[0];
    e.target.value = "";
    if (file) onFile(file);
  }

  function drop(e) {
    e.preventDefault();
    setDragging(false);
    if (busy) return;
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  }

  return (
    <div
      className={`drop ${has ? "drop-has" : ""} ${dragging ? "drop-over" : ""} ${busy ? "drop-busy" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        if (!busy) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={drop}
    >
      <input id={id} type="file" accept="image/png,image/jpeg" onChange={pick} disabled={busy} />

      {busy && <div className="drop-status">Uploading...</div>}

      {!busy && !has && (
        <label htmlFor={id} className="drop-empty">
          <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 16V4" />
            <path d="M7 9l5-5 5 5" />
            <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
          </svg>
          <span className="drop-title">Choose a photo or drop it here</span>
          <span className="drop-sub">JPG or PNG</span>
        </label>
      )}

      {!busy && has && (
        <div className="drop-body">
          <div className="drop-preview">{children}</div>
          <div className="drop-actions">
            <label htmlFor={id} className="drop-btn">Replace</label>
            {onRemove && (
              <button type="button" className="secondary" onClick={onRemove}>
                Remove
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
