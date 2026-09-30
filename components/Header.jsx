"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ShoppingCart, Menu, X } from "lucide-react";
import { getLocal } from "@/lib/utils";

export default function Header() {
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const update = () => {
      setCartCount(getLocal("cart", []).length);
      setUser(getLocal("currentUser"));
      setIsAdmin(typeof window !== "undefined" && localStorage.getItem("isAdmin") === "true");
    };
    update();
    window.addEventListener("storage", update);
    window.addEventListener("cartUpdated", update);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("cartUpdated", update);
    };
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const logout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("isAdmin");
    setUser(null);
    setIsAdmin(false);
    setMobileOpen(false);
    router.push("/login");
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/tests", label: "Tests" },
    { href: "/book-test", label: "Book Appointment" },
    ...(user ? [{ href: "/dashboard", label: "Dashboard" }] : []),
    ...(user ? [{ href: "/my-results", label: "My Results" }] : []),
    ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <header className="bg-white sticky top-0 z-50 border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2.5 shrink-0" onClick={() => setMobileOpen(false)}>
          <img src="/logo-icon.svg" alt="HomeLab GH" className="w-9 h-9" />
          <div className="leading-none">
            <span className="font-extrabold text-[#0A1931] text-lg">
              HomeLab <span className="text-[#0D6EFD]">GH</span>
            </span>
            <p className="text-[9px] text-[#0D6EFD] font-medium tracking-[1.5px] mt-0.5 hidden sm:block">
              HOME · SAMPLE · RESULT
            </p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-600">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-[#0D6EFD] transition">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/tests" className="relative p-2 rounded-full hover:bg-gray-50 transition" aria-label="Cart">
            <ShoppingCart size={20} className="text-gray-600" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#0D6EFD] text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <button
              onClick={logout}
              className="hidden sm:flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#0D6EFD]"
            >
              <div className="w-8 h-8 bg-[#E8F0FE] rounded-full flex items-center justify-center text-[#0D6EFD] font-bold text-sm border border-blue-100">
                {user.fullName?.[0] || "U"}
              </div>
              <span>Logout</span>
            </button>
          ) : (
            <Link
              href="/login"
              className="hidden sm:inline-flex bg-[#0D6EFD] hover:bg-[#0B5ED7] text-white px-5 py-2 rounded-lg text-sm font-semibold transition shadow-sm"
            >
              Login
            </Link>
          )}

          <button
            type="button"
            className="md:hidden p-2 rounded-lg hover:bg-gray-50 border border-gray-100"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed top-[57px] left-0 right-0 bottom-0 z-50 md:hidden bg-white overflow-y-auto shadow-xl">
            <nav className="flex flex-col p-4 gap-1">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:bg-[#E8F0FE] hover:text-[#0D6EFD]"
                >
                  {l.label}
                </Link>
              ))}
              <div className="border-t border-gray-100 my-2" />
              {user ? (
                <button
                  onClick={logout}
                  className="px-4 py-3 rounded-xl text-left text-base font-medium text-red-600 hover:bg-red-50"
                >
                  Logout ({user.fullName?.split(" ")[0] || "User"})
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="mx-2 mt-1 bg-[#0D6EFD] text-white text-center py-3 rounded-xl font-semibold"
                >
                  Login / Sign up
                </Link>
              )}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
