"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useState } from "react";
import { LocaleProvider } from "./locale-provider";
import { AdminAuthProvider } from "./admin-auth-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return <QueryClientProvider client={queryClient}><AdminAuthProvider><LocaleProvider>{children}</LocaleProvider></AdminAuthProvider></QueryClientProvider>;
}
