import type { Session, User } from "@supabase/supabase-js";
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { isSupabaseConfigured } from "@/lib/supabase";
import { authService, isRemoteMode } from "@/services";

type AuthContextValue = {
  authError: string;
  clearAuthError: () => void;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  isRemoteMode: boolean;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  user: User | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function getFriendlyAuthError(error: unknown) {
  const message = error instanceof Error ? error.message : "";

  if (message.includes("Supabase is not configured")) {
    return "请先配置 Supabase URL 和 anon key。";
  }

  if (message.toLowerCase().includes("invalid login credentials")) {
    return "邮箱或密码不正确。";
  }

  if (message.toLowerCase().includes("password")) {
    return "密码不符合要求，请至少输入 6 位。";
  }

  return message || "登录失败，请稍后再试。";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authError, setAuthError] = useState("");
  const [isAuthReady, setIsAuthReady] = useState(!isRemoteMode);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!isRemoteMode) {
      setIsAuthReady(true);
      return undefined;
    }

    if (!isSupabaseConfigured) {
      setAuthError("请先配置 Supabase URL 和 anon key。");
      setIsAuthReady(true);
      return undefined;
    }

    let isMounted = true;

    authService
      .getSession()
      .then((result) => {
        if (!isMounted) {
          return;
        }

        setSession(result.session);
        setUser(result.user);
      })
      .catch((error) => {
        console.error("Failed to initialize auth state", error);
        if (isMounted) {
          setAuthError(getFriendlyAuthError(error));
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsAuthReady(true);
        }
      });

    const { data } = authService.onAuthStateChange((result) => {
      setSession(result.session);
      setUser(result.user);
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setAuthError("");
      const result = await authService.signIn(email.trim(), password);
      setSession(result.session);
      setUser(result.user);
    } catch (error) {
      const friendlyError = getFriendlyAuthError(error);
      setAuthError(friendlyError);
      throw new Error(friendlyError);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      setAuthError("");
      const result = await authService.signUp(email.trim(), password);
      setSession(result.session);
      setUser(result.user);
    } catch (error) {
      const friendlyError = getFriendlyAuthError(error);
      setAuthError(friendlyError);
      throw new Error(friendlyError);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setAuthError("");
      await authService.signOut();
      setSession(null);
      setUser(null);
    } catch (error) {
      const friendlyError = getFriendlyAuthError(error);
      setAuthError(friendlyError);
      throw new Error(friendlyError);
    }
  }, []);

  const clearAuthError = useCallback(() => setAuthError(""), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      authError,
      clearAuthError,
      isAuthenticated: !isRemoteMode || Boolean(user),
      isAuthReady,
      isRemoteMode,
      session,
      signIn,
      signOut,
      signUp,
      user
    }),
    [authError, clearAuthError, isAuthReady, session, signIn, signOut, signUp, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return value;
}
