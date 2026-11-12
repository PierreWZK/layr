"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { setRemoteFavorites, syncFavorites } from "@/lib/favorites-store";

export type AccountUser = {
  id: string;
  email: string;
  displayName: string | null;
  role: "visitor" | "admin";
  createdAt: string;
};

type AccountValue = {
  user: AccountUser | null;
  ready: boolean;
  setUser: (user: AccountUser | null) => void;
  signOut: () => Promise<void>;
};

const AccountContext = createContext<AccountValue | null>(null);

// Session connue du navigateur. Connexion : les favoris locaux sont fusionnés dans le compte.
export function AccountProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AccountUser | null>(null);
  const [ready, setReady] = useState(false);

  const setUser = useCallback((next: AccountUser | null) => {
    setUserState(next);
    setRemoteFavorites(next !== null);
    if (next) syncFavorites().catch(() => {});
  }, []);

  useEffect(() => {
    let alive = true;
    fetch("/api/me", { cache: "no-store" })
      .then((res) => res.json())
      .then((data: { user: AccountUser | null }) => {
        if (alive) setUser(data.user ?? null);
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setReady(true);
      });
    return () => {
      alive = false;
    };
  }, [setUser]);

  const signOut = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    setUser(null);
  }, [setUser]);

  const value = useMemo(() => ({ user, ready, setUser, signOut }), [user, ready, setUser, signOut]);
  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount(): AccountValue {
  const context = useContext(AccountContext);
  if (!context) throw new Error("useAccount doit être utilisé dans AccountProvider");
  return context;
}
