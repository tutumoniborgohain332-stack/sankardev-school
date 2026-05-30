"use client";

import { useGetMe, useLogout } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, UserSquare2, Image as ImageIcon, FileText, UserPlus, LogOut, Loader2, Award, CalendarCheck } from "lucide-react";
import { PWAInstallButton } from "@/components/pwa-install-button";
import { motion } from "framer-motion";
import { useEffect } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: user, isLoading } = useGetMe();
  const logout = useLogout();

  const isPrivileged = user?.role === "admin" || user?.role === "principal" || user?.role === "vice_principal";

  useEffect(() => {
    if (!isLoading) {
      if (!user || !isPrivileged) {
        router.push("/login/staff");
      }
    }
  }, [user, isLoading, isPrivileged, router]);

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
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <motion.aside 
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        className="w-64 flex-shrink-0 bg-primary text-primary-foreground flex flex-col shadow-xl z-10 sticky top-0 h-screen"
      >
        <div className="p-6 border-b border-primary-foreground/10">
          <h2 className="text-xl font-bold font-serif tracking-tight">Admin Portal</h2>
          <p className="text-xs text-primary-foreground/70 mt-1 truncate">{user.name}</p>
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
      
      <main className="flex-1 overflow-y-auto w-full min-w-0">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
