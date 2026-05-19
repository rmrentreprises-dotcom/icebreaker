/**
 * Auth context: manages user state, login/register/guest flows, language.
 */
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, getToken, setToken } from "./api";
import { Lang } from "./theme";

interface User {
  id: string;
  email: string | null;
  full_name: string | null;
  language: Lang;
  is_guest: boolean;
  is_premium: boolean;
  trial_ends_at: string | null;
  lifetime_ai_calls_used: number;
  lifetime_ai_calls_remaining: number;
  onboarding_complete?: boolean;
  quiz_answers?: any;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  language: Lang;
  signInGuest: (lang: Lang) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, full_name: string, lang: Lang) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  setLanguage: (lang: Lang) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const bootstrap = useCallback(async () => {
    try {
      const token = await getToken();
      if (token) {
        const { user } = await api.me();
        setUser(user);
      }
    } catch {
      await setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const refresh = useCallback(async () => {
    try {
      const { user } = await api.me();
      setUser(user);
    } catch {
      // ignore
    }
  }, []);

  const signInGuest = async (lang: Lang) => {
    const r = await api.guest(lang);
    await setToken(r.access_token);
    setUser(r.user);
  };
  const signIn = async (email: string, password: string) => {
    const r = await api.login(email, password);
    await setToken(r.access_token);
    setUser(r.user);
  };
  const signUp = async (email: string, password: string, full_name: string, lang: Lang) => {
    const r = await api.register(email, password, full_name, lang);
    await setToken(r.access_token);
    setUser(r.user);
  };
  const signOut = async () => {
    await setToken(null);
    setUser(null);
  };
  const setLanguage = async (lang: Lang) => {
    if (!user) return;
    const { user: u } = await api.setLanguage(lang);
    setUser(u);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        language: (user?.language as Lang) || "en",
        signInGuest,
        signIn,
        signUp,
        signOut,
        refresh,
        setLanguage,
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
