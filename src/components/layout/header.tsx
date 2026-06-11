"use client";

import Link from "next/link";
import { useGetMe, useLogout, useGetAdmissionSettings } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Menu, X, GraduationCap, School } from "lucide-react";
import { useState } from "react";
import { PWAInstallButton } from "@/components/pwa-install-button";

export function Header() {
  const { data: user } = useGetMe();
  const { data: admissionSettings } = useGetAdmissionSettings();
  const admissionOpen = admissionSettings?.admissionOpen !== false;
  const logout = useLogout();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary-foreground/10 backdrop-blur-md bg-primary/90 text-primary-foreground shadow-md">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="flex justify-between items-center py-2 border-b border-primary-foreground/20 text-xs md:text-sm">
          <div className="hidden md:block">
            <span>শিশু শিক্ষা সমিতি, অসমৰ অন্তৰ্গত</span>
          </div>
          <div className="flex gap-4 items-center w-full md:w-auto justify-between md:justify-end">
            <span className="md:hidden">শিশু শিক্ষা সমিতি, অসমৰ অন্তৰ্গত</span>
            <div className="flex gap-2">
              {user ? (
                <div className="flex items-center gap-4">
                  <Link
                    href={
                      user.role === "admin" || user.role === "principal"
                        ? "/admin"
                        : user.role === "staff"
                        ? "/portal/staff"
                        : user.role === "student"
                        ? "/portal/student"
                        : "/"
                    }
                    className="hover:underline font-semibold"
                  >
                    Welcome, {user.name}
                  </Link>
                  <button onClick={() => logout.mutate(undefined, { onSuccess: () => window.location.href = "/" })} className="hover:underline">
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/login/student" className="hover:text-accent font-medium transition-colors">Student Login</Link>
                  <span className="text-primary-foreground/50">|</span>
                  <Link href="/login/staff" className="hover:text-accent font-medium transition-colors">Staff Login</Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="shrink-0">
              <img src="/logo-25.png" alt="Sankardev Sishu Vidya Niketan Mathurapur" className="h-14 md:h-16 w-auto shrink-0 object-contain" />
            </Link>
            <div>
              <h1 className="text-xl md:text-3xl font-bold font-serif text-white drop-shadow-sm">
                শংকৰদেৱ শিশু নিকেতন মথুৰাপুৰ
              </h1>
              <p className="text-sm md:text-base font-semibold tracking-wide">
                Sankardev Sishu Vidya Niketan Mathurapur
              </p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex gap-6 items-center font-medium">
            <Link href="/" className="hover:text-white/80 transition-colors">Home</Link>

            <Link href="/academics" className="hover:text-white/80 transition-colors">Academics</Link>
            {admissionOpen && <Link href="/admission" className="hover:text-white/80 transition-colors">Admission</Link>}
            <Link href="/gallery" className="hover:text-white/80 transition-colors">Gallery</Link>
            <Link href="/staff" className="hover:text-white/80 transition-colors">Staff</Link>
            <Link href="/news" className="hover:text-white/80 transition-colors">News</Link>
            <Link href="/results" className="hover:text-white/80 transition-colors">Results</Link>
            <Link href="/contact" className="hover:text-white/80 transition-colors">Contact</Link>
            {(!user && admissionOpen) && (
              <Button asChild variant="outline" className="font-bold ml-2 border-white text-white hover:bg-white hover:text-primary transition-all active:scale-95 shadow-[0_4px_14px_0_rgba(0,0,0,0.1)]">
                <Link href="/admission">Apply Now</Link>
              </Button>
            )}
            <PWAInstallButton />
          </nav>

          {/* Mobile Menu Button */}
          <button className="lg:hidden p-2" onClick={toggleMenu} aria-label="Toggle menu" aria-expanded={isMobileMenuOpen}>
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-primary border-b border-primary-foreground/20 shadow-lg py-4 px-4 flex flex-col gap-4 font-medium text-lg">
          <Link href="/" className="block py-2 border-b border-primary-foreground/10" onClick={toggleMenu}>Home</Link>

          <Link href="/academics" className="block py-2 border-b border-primary-foreground/10" onClick={toggleMenu}>Academics</Link>
          {admissionOpen && <Link href="/admission" className="block py-2 border-b border-primary-foreground/10" onClick={toggleMenu}>Admission</Link>}
          <Link href="/gallery" className="block py-2 border-b border-primary-foreground/10" onClick={toggleMenu}>Gallery</Link>
          <Link href="/staff" className="block py-2 border-b border-primary-foreground/10" onClick={toggleMenu}>Staff</Link>
          <Link href="/news" className="block py-2 border-b border-primary-foreground/10" onClick={toggleMenu}>News</Link>
          <Link href="/results" className="block py-2 border-b border-primary-foreground/10" onClick={toggleMenu}>Results</Link>
          <Link href="/contact" className="block py-2 border-b border-primary-foreground/10" onClick={toggleMenu}>Contact</Link>
          <div className="pt-2">
            <PWAInstallButton />
          </div>
        </div>
      )}
    </header>
  );
}

