import { Link, useNavigate } from "react-router-dom";
import { useAuth, homePathFor } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="nav">
      <Link to="/" className="brand">Formy</Link>
      <div className="nav-links">
        {user ? (
          <>
            <Link to={homePathFor(user.role)}>Dashboard</Link>
            <span className="muted">{user.name} ({user.role})</span>
            <button
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
