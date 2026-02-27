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

async function ensureProfile(supaUser: SupabaseUser, name?: string): Promise<User> {
  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", supaUser.id)
    .single();

  if (existing) {
    return { id: existing.id, email: existing.email || supaUser.email || "", name: existing.full_name };
  }

  const fullName = name || supaUser.user_metadata?.full_name || supaUser.email?.split("@")[0] || "User";
  await supabase
    .from("profiles")
    .insert({ id: supaUser.id, email: supaUser.email, full_name: fullName });

  return { id: supaUser.id, email: supaUser.email || "", name: fullName };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const skipNextAuthChange = useRef(false);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const profile = await ensureProfile(session.user);
        setUser(profile);
      }
      setLoading(false);
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // Skip if login/signup already set the user (avoids double ensureProfile)
      if (skipNextAuthChange.current) {
        skipNextAuthChange.current = false;
        return;
      }
      if (session?.user) {
        const profile = await ensureProfile(session.user);
        setUser(profile);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signup = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (error) throw new Error(error.message);
    if (data.user) {
      skipNextAuthChange.current = true;
      const profile = await ensureProfile(data.user, name);
      setUser(profile);
    }
  };

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    if (data.user) {
      skipNextAuthChange.current = true;
      const profile = await ensureProfile(data.user);
      setUser(profile);
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
