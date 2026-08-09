import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    const raw = localStorage.getItem("sip_session");
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (session) {
      localStorage.setItem("sip_session", JSON.stringify(session));
    } else {
      localStorage.removeItem("sip_session");
    }
  }, [session]);

  async function login(email, password) {
    const data = await api.login({ email, password });
    setSession(data);
    return data;
  }

  async function signup(payload) {
    const data = await api.signup(payload);
    setSession(data);
    return data;
  }

  function logout() {
    setSession(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        token: session?.token ?? null,
        isManager: session?.user?.role === "MANAGER",
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
