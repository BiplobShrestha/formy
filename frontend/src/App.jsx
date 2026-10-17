import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function App() {
  const [status, setStatus] = useState("checking...");

  useEffect(() => {
    fetch(`${API}/api/health`)
      .then((r) => r.json())
      .then((d) => setStatus(`${d.app} backend ${d.version}: ${d.status}`))
      .catch(() => setStatus("backend not reachable"));
  }, []);

  return (
    <div style={{ fontFamily: "sans-serif", padding: 40 }}>
      <h1>Formy</h1>
      <p>Hello world (v0). Frontend is live.</p>
      <p>Backend check: {status}</p>
    </div>
  );
}
