import { useAuth } from "../context/AuthContext.jsx";

export default function OfficerDashboard() {
  const { user } = useAuth();
  return (
    <div className="page">
      <h1>Officer: {user.name}</h1>
      <p>Applications forwarded by the admin will appear here.</p>
      <p className="muted">Officer review arrives in v4.</p>
    </div>
  );
}
