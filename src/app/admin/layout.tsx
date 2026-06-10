"use client";

import { useGetMe, useLogout } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, UserSquare2, Image as ImageIcon, FileText, UserPlus, LogOut, Loader2, Award, CalendarCheck, Menu, X, ShieldAlert } from "lucide-react";
import { PWAInstallButton } from "@/components/pwa-install-button";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: user, isLoading } = useGetMe();
  const logout = useLogout();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isPrivileged = user?.role === "admin" || user?.role === "principal" || user?.role === "vice_principal";

  useEffect(() => {
    if (!isLoading) {
      if (!user || !isPrivileged) {
        router.push("/login/staff");
      }
    }
  }, [user, isLoading, isPrivileged, router]);

  // Close sidebar on route change on mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isPrivileged) {
    return null;
  }

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Students", href: "/admin/students", icon: Users },
    { label: "Staff", href: "/admin/staff", icon: UserSquare2 },
    { label: "Gallery", href: "/admin/gallery", icon: ImageIcon },
    { label: "News", href: "/admin/news", icon: FileText },
    { label: "Admissions", href: "/admin/admissions", icon: UserPlus },
    { label: "Attendance", href: "/admin/attendance", icon: CalendarCheck },
    { label: "Results", href: "/admin/results", icon: Award },
    { label: "Complaints", href: "/admin/complaints", icon: ShieldAlert },
  ];

  return (
    <div className="flex min-h-screen bg-background relative">
      {/* Mobile Topbar */}
      <div className="md:hidden fixed top-0 w-full z-20 bg-primary text-primary-foreground p-4 flex justify-between items-center shadow-md">
        <h2 className="font-bold font-serif">Admin Portal</h2>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      <motion.aside 
        className={`w-64 flex-shrink-0 bg-primary text-primary-foreground flex flex-col shadow-xl z-30 h-screen fixed md:sticky top-0 transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="p-6 border-b border-primary-foreground/10 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold font-serif tracking-tight">Admin Portal</h2>
            <p className="text-xs text-primary-foreground/70 mt-1 truncate">{user.name}</p>
          </div>
          <button className="md:hidden" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            const Icon = item.icon;
            
            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors cursor-pointer ${
                  isActive 
                    ? "bg-primary-foreground/15 font-medium shadow-sm" 
                    : "hover:bg-primary-foreground/10 text-primary-foreground/80 hover:text-primary-foreground"
                }`}>
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-primary-foreground/10 space-y-2">
          {/* <PWAInstallButton /> */}
          <Button 
            variant="ghost" 
            className="w-full justify-start text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            onClick={() => logout.mutate(undefined, { onSuccess: () => router.push("/") })}
          >
            <LogOut className="mr-2 h-5 w-5" />
            Logout
          </Button>
        </div>
      </motion.aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
          role="button"
          tabIndex={0}
          aria-label="Close Sidebar"
          onKeyDown={(e) => e.key === 'Escape' && setIsSidebarOpen(false)}
        />
      )}
      
      <main className="flex-1 overflow-y-auto w-full min-w-0 pt-16 md:pt-0">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
