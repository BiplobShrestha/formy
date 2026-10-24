import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, homePathFor } from "../context/AuthContext.jsx";
import Icon, { Logo } from "./Icon.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link to="/" className="brand" onClick={close}>
          <Logo /> Formy
        </Link>
        <button className="nav-toggle secondary" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>
          <Icon name={open ? "close" : "menu"} />
        </button>
        <div className={open ? "nav-links open" : "nav-links"}>
          {user ? (
            <>
              {user.role === "customer" && <Link className="nav-link" to="/forms" onClick={close}>Forms</Link>}
              <Link className="nav-link" to={homePathFor(user.role)} onClick={close}>
                {user.role === "customer" ? "My applications" : "Applications"}
              </Link>
              {user.role === "admin" && <Link className="nav-link" to="/admin/notices" onClick={close}>Notices</Link>}
              <Link className="nav-link" to="/account" onClick={close}>
                {user.name} ({user.role})
              </Link>
              <button
                className="secondary"
                onClick={() => {
                  close();
                  logout();
                  navigate("/");
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="nav-link" to="/login" onClick={close}>Log in</Link>
              <Link className="btn" to="/register" onClick={close}>Create an account</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
