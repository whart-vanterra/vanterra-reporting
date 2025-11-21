"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { createBrowserClient } from "@supabase/ssr";
import { LayoutDashboard, LogOut } from "lucide-react";

const navItems = [
  {
    href: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
];

export function Navigation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Preserve current filters when navigating
  const queryString = searchParams.toString();
  const preservedQuery = queryString ? `?${queryString}` : "";

  const handleLogout = async () => {
    const authDomain =
      process.env.NEXT_PUBLIC_AUTH_DOMAIN ||
      "https://auth.vanterrafoundations.com";
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

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
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="h-6 w-6" />
              <span className="font-bold text-lg">Vanterra Reporting</span>
            </div>
            <div className="flex gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                const href = `${item.href}${preservedQuery}`;

                return (
                  <Link
                    key={item.href}
                    href={href}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
