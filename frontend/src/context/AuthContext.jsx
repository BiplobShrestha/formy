import { createContext, useContext, useEffect, useState } from "react";
import { api, getToken, setToken } from "../api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!getToken());

  useEffect(() => {
    if (!getToken()) return;
    api("/api/auth/me")
      .then((d) => setUser(d.user))
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(phone, password) {
    const d = await api("/api/auth/login", { method: "POST", body: { phone, password } });
    setToken(d.token);
    setUser(d.user);
    return d.user;
  }

  async function register(name, phone, password) {
    const d = await api("/api/auth/register", {
      method: "POST",
      body: { name, phone, password },
    });
    setToken(d.token);
    setUser(d.user);
    return d.user;
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function homePathFor(role) {
  if (role === "admin") return "/admin";
  if (role === "officer") return "/officer";
  return "/dashboard";
}
