import { useAuth } from "../context/AuthContext.jsx";

export default function CustomerDashboard() {
  const { user } = useAuth();
  return (
    <div className="page">
      <h1>Welcome, {user.name}</h1>
      <p>Your applications will appear here.</p>
      <p className="muted">Forms and application tracking arrive in v2.</p>
    </div>
  );
}
