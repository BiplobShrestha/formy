import { Link } from "react-router-dom";
import { Logo } from "./Icon.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Footer() {
  const { user } = useAuth();
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <span className="brand"><Logo /> Formy</span>
          <div style={{ marginTop: 8, maxWidth: 420 }}>
            Formy is a student project. It is not an official government service.
          </div>
        </div>
        {!user && (
          <div>
            <Link to="/login">Log in</Link> &nbsp; <Link to="/register">Create an account</Link>
          </div>
        )}
      </div>
    </footer>
  );
}
