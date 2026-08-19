"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { verifyAdminAuthorization } from "@/services/api-client";

type AdminAuthContextValue = {
  authenticated: boolean;
  ready: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [authorization, setAuthorization] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setAuthorization(sessionStorage.getItem("visafyAdminAuthorization"));
    setReady(true);
  }, []);

  async function login(username: string, password: string) {
    const bytes = new TextEncoder().encode(`${username}:${password}`);
    let binary = "";
    bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
    const encoded = btoa(binary);
    const nextAuthorization = `Basic ${encoded}`;
    await verifyAdminAuthorization(nextAuthorization);
    sessionStorage.setItem("visafyAdminAuthorization", nextAuthorization);
    setAuthorization(nextAuthorization);
  }

  function logout() {
    sessionStorage.removeItem("visafyAdminAuthorization");
    setAuthorization(null);
  }

  const value = useMemo(() => ({ authenticated: Boolean(authorization), ready, login, logout }), [authorization, ready]);
  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return context;
}
