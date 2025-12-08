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
  const [userName, setUserName] = useState<string | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      try {
        // Safe JWT decode
        const base64Url = token.split('.')[1];
        if (!base64Url) throw new Error("Invalid token format");

        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const payload = JSON.parse(jsonPayload);
        setRole(payload.role);

        // Fetch Profile & Photo if Student
        if (payload.role === 'STUDENT') {
          import("@/lib/api").then(async (api) => {
            try {
              const profile = await api.getProfile();
              setUserName(profile.name);

              const docs = await api.getMyDocuments();
              const photoDoc = docs.find((d: any) => d.kind === 'PHOTO');
              if (photoDoc) {
                setUserPhoto(photoDoc.fileUrl);
              }
            } catch (e) {
              console.error("Failed to fetch user details", e);
            }
          });
        }
      } catch (e) {
        // Silent cleanup for invalid tokens
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        setRole(null);
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
    setUserName(null);
    setUserPhoto(null);
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
                    <NavLink href="/student/allotment" active={isActive("/student/allotment")}>Allotment</NavLink>
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
                    {role === "ADMIN" && (
                      <>
                        <NavLink href="/admin/requests" active={isActive("/admin/requests")}>Requests</NavLink>
                        <NavLink href="/admin/complaints" active={isActive("/admin/complaints")}>Complaints</NavLink>
                        <NavLink href="/admin/hostels" active={isActive("/admin/hostels")}>Hostels</NavLink>
                        <NavLink href="/admin/students" active={isActive("/admin/students")}>Students</NavLink>
                        <NavLink href="/admin/allotment" active={isActive("/admin/allotment")}>Allotment</NavLink>
                        <NavLink href="/admin/refunds" active={isActive("/admin/refunds")}>Refunds</NavLink>
                        <NavLink href="/admin/imports" active={isActive("/admin/imports")}>Imports</NavLink>
                        <NavLink href="/admin/analytics" active={isActive("/admin/analytics")}>Analytics</NavLink>
                      </>
                    )}

                    {role === "WARDEN" && (
                      <>
                        <NavLink href="/warden/dashboard" active={isActive("/warden/dashboard")}>Requests</NavLink>
                        <NavLink href="/warden/complaints" active={isActive("/warden/complaints")}>Complaints</NavLink>
                        <NavLink href="/admin/students" active={isActive("/admin/students")}>Students</NavLink>
                      </>
                    )}
                  </>
                )}
              </div>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full overflow-hidden aspect-square p-0">
                    {userPhoto ? (
                      <img
                        src={userPhoto}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-slate-100 flex items-center justify-center">
                        <UserIcon className="h-4 w-4" />
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{userName || 'My Account'}</p>
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
    </nav >
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
