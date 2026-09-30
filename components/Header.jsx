"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { getLocal } from "@/lib/utils";

export default function Header() {
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

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

  const logout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("isAdmin");
    setUser(null);
    setIsAdmin(false);
    router.push("/login");
  };

  return (
    <header className="bg-white sticky top-0 z-50 border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <img src="/logo-icon.svg" alt="HomeLab GH" className="w-9 h-9" />
          <div className="leading-none">
            <span className="font-extrabold text-[#0A1931] text-lg">HomeLab <span className="text-[#0D6EFD]">GH</span></span>
            <p className="text-[9px] text-[#0D6EFD] font-medium tracking-[1.5px] mt-0.5">HOME · SAMPLE · RESULT</p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-600">
          <Link href="/" className="hover:text-[#0D6EFD] transition">Home</Link>
          <Link href="/tests" className="hover:text-[#0D6EFD] transition">Tests</Link>
          <Link href="/book-test" className="hover:text-[#0D6EFD] transition">Book Appointment</Link>
          {user && <Link href="/dashboard" className="hover:text-[#0D6EFD] transition">Dashboard</Link>}
          {user && <Link href="/my-results" className="hover:text-[#0D6EFD] transition">My Results</Link>}
          {isAdmin && <Link href="/admin" className="hover:text-[#0D6EFD] transition">Admin</Link>}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/tests" className="relative p-2 rounded-full hover:bg-gray-50 transition">
            <ShoppingCart size={20} className="text-gray-600" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#0D6EFD] text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <button onClick={logout} className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#0D6EFD]">
              <div className="w-8 h-8 bg-[#E8F0FE] rounded-full flex items-center justify-center text-[#0D6EFD] font-bold text-sm border border-blue-100">
                {user.fullName?.[0] || "U"}
              </div>
              <span className="hidden sm:inline">Logout</span>
            </button>
          ) : (
            <Link href="/login" className="bg-[#0D6EFD] hover:bg-[#0B5ED7] text-white px-5 py-2 rounded-lg text-sm font-semibold transition shadow-sm">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}