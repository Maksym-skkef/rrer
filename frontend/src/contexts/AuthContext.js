import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";

const AuthContext = createContext(null);
const TOKEN_KEY = "hs_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restore = async () => {
      const token = (() => {
        try { return localStorage.getItem(TOKEN_KEY); } catch (_) { return null; }
      })();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get("/api/auth/me");
        setUser(res.data);
      } catch (_) {
        try { localStorage.removeItem(TOKEN_KEY); } catch (_) {}
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  const login = async (email, password) => {
    try { localStorage.setItem("hs_dbg", "start"); } catch (_) {}
    try {
      const res = await api.post("/api/auth/login", { email, password });
      try { localStorage.setItem("hs_dbg", "ok:" + (res.data?.access_token ? "token" : "notoken")); } catch (_) {}
      if (res.data?.access_token) {
        try { localStorage.setItem(TOKEN_KEY, res.data.access_token); } catch (_) {}
      }
      setUser(res.data);
      return { success: true };
    } catch (err) {
      try { localStorage.setItem("hs_dbg", "err:" + (err?.message || "?") + ":" + (err?.response?.status || "no-resp")); } catch (_) {}
      const msg = err?.response?.data?.detail || "Помилка входу. Перевірте дані.";
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    try { await api.post("/api/auth/logout"); } catch (_) {}
    try { localStorage.removeItem(TOKEN_KEY); } catch (_) {}
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
