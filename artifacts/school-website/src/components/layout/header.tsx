import { Link } from "wouter";
import { useGetMe, useLogout } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Menu, X, GraduationCap, School } from "lucide-react";
import { useState } from "react";
import { PWAInstallButton } from "@/components/pwa-install-button";

export function Header() {
  const { data: user } = useGetMe();
  const logout = useLogout();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-primary text-primary-foreground shadow-md">
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
                  <span>Welcome, {user.name}</span>
                  {user.role === "admin" && (
                    <Link href="/admin" className="hover:underline">Admin</Link>
                  )}
                  {user.role === "staff" && (
                    <Link href="/portal/staff" className="hover:underline">Portal</Link>
                  )}
                  {user.role === "student" && (
                    <Link href="/portal/student" className="hover:underline">Portal</Link>
                  )}
                  <button onClick={() => logout.mutate(undefined, { onSuccess: () => window.location.href = "/" })} className="hover:underline">
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  {/* <Link href="/login/student" className="hover:underline">Student Login</Link> */}
                  <Link href="/login/staff" className="hover:underline">Staff Login</Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="shrink-0">
              <img src="/logo-25.png" alt="Sankardev Sishu Vidya Niketan Mathurapure" className="h-14 md:h-16 w-auto shrink-0 object-contain" />
            </Link>
            <div>
              <h1 className="text-xl md:text-3xl font-bold font-serif text-accent drop-shadow-sm">
                শংকৰদেৱ শিশু নিকেতন মথুৰাপুৰ
              </h1>
              <p className="text-sm md:text-base font-semibold tracking-wide">
                Sankardev Sishu Vidya Niketan Mathurapure
              </p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex gap-6 items-center font-medium">
            <Link href="/" className="hover:text-accent transition-colors">Home</Link>

            <Link href="/academics" className="hover:text-accent transition-colors">Academics</Link>
            <Link href="/admission" className="hover:text-accent transition-colors">Admission</Link>
            <Link href="/gallery" className="hover:text-accent transition-colors">Gallery</Link>
            <Link href="/staff" className="hover:text-accent transition-colors">Staff</Link>
            <Link href="/news" className="hover:text-accent transition-colors">News</Link>
            <Link href="/results" className="hover:text-accent transition-colors">Results</Link>
            <Link href="/contact" className="hover:text-accent transition-colors">Contact</Link>
            {!user && (
              <Button asChild variant="outline" className="font-bold ml-2 border-white text-white hover:bg-white hover:text-primary">
                <Link href="/admission">Apply Now</Link>
              </Button>
            )}
            <PWAInstallButton />
          </nav>

          {/* Mobile Menu Button */}
          <button className="lg:hidden p-2" onClick={toggleMenu} aria-label="Toggle menu">
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-primary border-b border-primary-foreground/20 shadow-lg py-4 px-4 flex flex-col gap-4 font-medium text-lg">
          <Link href="/" className="block py-2 border-b border-primary-foreground/10" onClick={toggleMenu}>Home</Link>

          <Link href="/academics" className="block py-2 border-b border-primary-foreground/10" onClick={toggleMenu}>Academics</Link>
          <Link href="/admission" className="block py-2 border-b border-primary-foreground/10" onClick={toggleMenu}>Admission</Link>
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
