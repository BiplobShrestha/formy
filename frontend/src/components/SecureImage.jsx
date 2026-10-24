import { useEffect, useState } from "react";
import { fetchBlob } from "../api.js";

// Shows an uploaded image. Files need the login token, so we fetch them as a blob.
export default function SecureImage({ fileId, alt }) {
  const [url, setUrl] = useState("");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let objectUrl = "";
    let cancelled = false;
    setFailed(false);
    fetchBlob(`/api/files/${fileId}`)
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [fileId]);

  if (failed) return <span className="muted">Could not load image</span>;
  if (!url) return <span className="muted">Loading image...</span>;
  return (
    <a href={url} target="_blank" rel="noreferrer" title="Click to open full size">
      <img className="thumb" src={url} alt={alt || "Uploaded document"} />
    </a>
  );
}
