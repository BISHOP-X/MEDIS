import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_resolve, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), ms);
  });

  return Promise.race([
    promise.finally(() => {
      if (timeoutId) clearTimeout(timeoutId);
    }),
    timeoutPromise,
  ]);
}

async function ensureProfile(supaUser: SupabaseUser, name?: string): Promise<User> {
  const fallbackName = name || supaUser.user_metadata?.full_name || supaUser.email?.split("@")[0] || "User";
  const fallback: User = { id: supaUser.id, email: supaUser.email || "", name: fallbackName };

  try {
    const { data: existing, error: selectErr } = await withTimeout(
      supabase.from("profiles").select("*").eq("id", supaUser.id).single(),
      8000,
      "Profile lookup timed out",
    );

    if (selectErr && selectErr.code !== "PGRST116") {
      // PGRST116 = row not found — anything else means table issue / RLS — just return fallback
      return fallback;
    }

    if (existing) {
      return { id: existing.id, email: existing.email || supaUser.email || "", name: existing.full_name || fallbackName };
    }

    // No row yet — try to insert, but don't block login if it fails
    await withTimeout(
      supabase.from("profiles").insert({ id: supaUser.id, email: supaUser.email, full_name: fallbackName }),
      8000,
      "Profile creation timed out",
    ).catch(() => {});

    return fallback;
  } catch {
    // profiles table missing, network error, RLS, anything — never block login
    return fallback;
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const skipNextAuthChange = useRef(false);

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await withTimeout(
          supabase.auth.getSession(),
          8000,
          "Session check timed out",
        );
        if (session?.user) {
          const profile = await ensureProfile(session.user);
          setUser(profile);
        }
      } catch {
        // session check failed — just proceed as logged-out
      }
      setLoading(false);
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (skipNextAuthChange.current) {
        skipNextAuthChange.current = false;
        return;
      }
      if (session?.user) {
        try {
          const profile = await ensureProfile(session.user);
          setUser(profile);
        } catch {
          // fallback — at least set basic user info so they're not stuck
          setUser({ id: session.user.id, email: session.user.email || "", name: session.user.email?.split("@")[0] || "User" });
        }
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signup = async (email: string, password: string, name: string) => {
    const { data, error } = await withTimeout(
      supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      }),
      15000,
      "Sign up timed out",
    );
    if (error) throw new Error(error.message);
    if (data.user) {
      skipNextAuthChange.current = true;
      try {
        const profile = await ensureProfile(data.user, name);
        setUser(profile);
      } catch {
        setUser({ id: data.user.id, email: data.user.email || "", name: name || data.user.email?.split("@")[0] || "User" });
      }
    }
  };

  const login = async (email: string, password: string) => {
    const { data, error } = await withTimeout(
      supabase.auth.signInWithPassword({ email, password }),
      15000,
      "Sign in timed out",
    );
    if (error) throw new Error(error.message);
    if (data.user) {
      skipNextAuthChange.current = true;
      try {
        const profile = await ensureProfile(data.user);
        setUser(profile);
      } catch {
        setUser({ id: data.user.id, email: data.user.email || "", name: data.user.email?.split("@")[0] || "User" });
      }
    }
  };

  const logout = () => {
    supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
