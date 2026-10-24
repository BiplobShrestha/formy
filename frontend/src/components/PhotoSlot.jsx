import { useState } from "react";
import Icon from "./Icon.jsx";

// Shows /images/<name>.jpg. If the file is not there yet, shows a placeholder that says what photo to add.
export default function PhotoSlot({ name, hint }) {
  const [missing, setMissing] = useState(false);
  if (!missing) {
    return <img className="photo" src={`/images/${name}.jpg`} alt="" onError={() => setMissing(true)} />;
  }
  return (
    <div className="photo photo-empty" role="img" aria-label={hint}>
      <Icon name="file" />
      <span>{hint}</span>
      <small>Add frontend/public/images/{name}.jpg</small>
    </div>
  );
}
