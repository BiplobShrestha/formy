import { useAuth } from "../context/AuthContext.jsx";

export default function AdminDashboard() {
  const { user } = useAuth();
  return (
    <div className="page">
      <h1>Admin: {user.name}</h1>
      <p>Submitted applications and the records review page will appear here.</p>
      <p className="muted">Review queue arrives in v3.</p>
    </div>
  );
}
