"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  FileText,
  AlertCircle,
  Utensils,
  BarChart3,
  LogOut,
  User as UserIcon,
  Menu
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      try {
        // Simple JWT decode without library
        const payload = JSON.parse(atob(token.split('.')[1]));
        setRole(payload.role);
      } catch (e) {
        console.error("Failed to decode token", e);
        // If token is invalid, maybe logout?
      }
    } else {
      setIsLoggedIn(false);
      setRole(null);
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setRole(null);
    router.push("/login");
  };

  // Hide navbar on auth pages, sub-routes, and the root landing page
  if (
    pathname === "/" ||
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/register")
  ) {
    return null;
  }

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="border-b bg-white sticky top-0 z-50 shadow-sm">
      <div className="flex h-16 items-center px-4 container mx-auto justify-between">
        <Link href="/" className="font-bold text-xl text-blue-900 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-900 rounded-lg flex items-center justify-center text-white text-sm">DTU</div>
          <span>Hostels</span>
        </Link>

        <div className="flex items-center space-x-6">
          {isLoggedIn ? (
            <>
              {/* Desktop Navigation Links */}
              <div className="hidden md:flex items-center space-x-4">
                {role === "STUDENT" && (
                  <>
                    <NavLink href="/student/profile" active={isActive("/student/profile")}>Profile</NavLink>
                    <NavLink href="/student/documents" active={isActive("/student/documents")}>Documents</NavLink>
                    <NavLink href="/student/preferences" active={isActive("/student/preferences")}>Preferences</NavLink>
                    <NavLink href="/student/payments" active={isActive("/student/payments")}>Payments</NavLink>
                    <NavLink href="/student/complaints" active={isActive("/student/complaints")}>Complaints</NavLink>
                    <NavLink href="/student/rebate" active={isActive("/student/rebate")}>Mess Rebate</NavLink>
                    <NavLink href="/student/requests" active={isActive("/student/requests")}>Requests</NavLink>
                  </>
                )}

                {(role === "ADMIN" || role === "WARDEN") && (
                  <>
                    <NavLink href="/warden/dashboard" active={isActive("/warden/dashboard")}>Requests</NavLink>
                    <NavLink href="/warden/complaints" active={isActive("/warden/complaints")}>Complaints</NavLink>
                    {role === "ADMIN" && (
                      <>
                        <NavLink href="/admin/hostels" active={isActive("/admin/hostels")}>Hostels</NavLink>
                        <NavLink href="/admin/allotment" active={isActive("/admin/allotment")}>Allotment</NavLink>
                        <NavLink href="/admin/refunds" active={isActive("/admin/refunds")}>Refunds</NavLink>
                        <NavLink href="/admin/analytics" active={isActive("/admin/analytics")}>Analytics</NavLink>
                      </>
                    )}
                  </>
                )}
              </div>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <div className="h-8 w-8 bg-slate-100 rounded-full flex items-center justify-center">
                      <UserIcon className="h-4 w-4" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">My Account</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {role}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Register</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`text-sm font-medium transition-colors hover:text-blue-600 ${active ? "text-blue-600 font-bold" : "text-slate-600"
        }`}
    >
      {children}
    </Link>
  );
}
