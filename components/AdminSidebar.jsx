"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Calendar,
  Users,
  ClipboardList,
  Upload,
  CreditCard,
  UserCog,
  Settings,
  Wrench,
  LogOut,
  FlaskConical,
  Menu,
  X,
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/bookings", label: "Bookings", icon: Calendar },
  { href: "/admin/clients", label: "Clients", icon: Users },
  { href: "/admin/catalog", label: "Test Catalog", icon: ClipboardList },
  { href: "/admin/results", label: "Results Upload", icon: Upload },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/staff", label: "Staff", icon: UserCog },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/maintenance", label: "Maintenance", icon: Wrench },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("isAdmin");
      localStorage.removeItem("currentUser");
    }
    router.push("/login");
  }

  const sidebarBody = (
    <>
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2563EB]">
          <FlaskConical className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold leading-tight">HomeLab GH</p>
          <p className="text-[11px] text-slate-400">Laboratory Service</p>
        </div>
        <button
          type="button"
          className="lg:hidden p-1.5 rounded-lg hover:bg-white/10"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <p className="px-5 pb-2 pt-5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        Menu
      </p>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-2">
        {NAV.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname?.startsWith(item.href + "/");
          const isMaint = item.href === "/admin/maintenance";
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? isMaint
                    ? "bg-red-600 text-white shadow-lg shadow-red-900/30"
                    : "bg-[#2563EB] text-white shadow-lg shadow-blue-900/30"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2563EB] text-xs font-bold">
            KM
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">Dr. Kojo Mensah</p>
            <p className="text-[11px] text-emerald-400">Admin · Online</p>
          </div>
        </div>
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 py-2 text-xs font-medium text-slate-300 hover:bg-white/5"
        >
          <LogOut className="h-3.5 w-3.5" /> Log out
        </button>
      </div>
    </>
  );

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center gap-3 bg-[#0F172A] text-white px-4 py-3 border-b border-white/10">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg hover:bg-white/10"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563EB]">
            <FlaskConical className="h-4 w-4" />
          </div>
          <span className="text-sm font-bold">HomeLab GH Admin</span>
        </div>
      </div>

      <aside className="hidden lg:flex fixed left-0 top-0 z-40 h-screen w-64 flex-col bg-[#0F172A] text-white">
        {sidebarBody}
      </aside>

      {open && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-50 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <aside className="lg:hidden fixed left-0 top-0 z-[60] flex h-screen w-[min(280px,85vw)] flex-col bg-[#0F172A] text-white shadow-2xl">
            {sidebarBody}
          </aside>
        </>
      )}
    </>
  );
}
