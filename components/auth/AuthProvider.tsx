"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      router.refresh();
    });

    return () => subscription.unsubscribe();
  }, [router, supabase.auth]);

  const signOut = async () => {
    const authDomain =
      process.env.NEXT_PUBLIC_AUTH_DOMAIN ||
      "https://auth.vanterrafoundations.com";

    try {
      // 1. Clear local storage first
      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
      }

      // 2. Call local logout endpoint to clear reporting app cookies
      try {
        await fetch("/api/logout", {
          method: "POST",
          credentials: "include",
        });
      } catch (error) {
        console.error("Local logout failed:", error);
      }

      // 3. Try to clear wildcard cookies via auth domain
      try {
        await fetch(`${authDomain}/api/logout`, {
          method: "POST",
          credentials: "include",
          mode: "no-cors", // Prevent CORS errors
        });
      } catch (error) {
        console.log("Wildcard cookie clear attempted");
      }

      // 4. Sign out from Supabase client
      await supabase.auth.signOut();

      // 5. Full page redirect to auth domain to complete logout
      window.location.href = `${authDomain}/login?redirected_from=reporting`;
    } catch (error) {
      console.error("Logout failed:", error);
      // Still redirect even if logout fails
      window.location.href = `${authDomain}/login`;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
