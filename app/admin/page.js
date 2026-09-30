"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Search,
  Bell,
  Plus,
  Calendar,
  Banknote,
  FlaskConical,
  Clock,
  TrendingUp,
  Upload,
  X,
} from "lucide-react";

const MOCK_CLIENTS = [
  {
    name: "Ama Boateng",
    address: "12 Spintex Road, Accra",
    tests: ["PCR Test", "Blood Panel"],
    date: "Oct 14, 2024 - 09:30 AM",
    status: "Pending",
  },
  {
    name: "Kwame Asamoah",
    address: "45 Oxford St, Kumasi",
    tests: ["COVID Test"],
    date: "Oct 13, 2024 - 11:00 AM",
    status: "Confirmed",
  },
  {
    name: "Esi Mensah",
    address: "22 Ringway Rd, Tema",
    tests: ["Full Blood Count"],
    date: "Oct 13, 2024 - 02:45 PM",
    status: "Awaiting Sample",
  },
  {
    name: "John Opoku",
    address: "9 Liberation Rd, Accra",
    tests: ["Malaria Test"],
    date: "Oct 12, 2024 - 10:15 AM",
    status: "Confirmed",
  },
  {
    name: "Fatima Alhassan",
    address: "7 Dansoman Rd, Accra",
    tests: ["Liver Function Test"],
    date: "Oct 12, 2024 - 08:30 AM",
    status: "Pending",
  },
];

const NOTIFICATIONS = [
  {
    id: 1,
    type: "appointment",
    title: "New Appointment",
    body: "New appointment from Ama Boateng - PCR Test",
    time: "2 mins ago",
    unread: true,
    icon: Calendar,
    iconBg: "bg-blue-50 text-blue-600",
  },
  {
    id: 2,
    type: "pending",
    title: "Pending Test",
    body: "Pending test result for Kwame Asamoah",
    time: "1 hour ago",
    unread: true,
    icon: FlaskConical,
    iconBg: "bg-orange-50 text-orange-600",
  },
  {
    id: 3,
    type: "upload",
    title: "Pending Upload",
    body: "3 results pending upload",
    time: "3 hours ago",
    unread: true,
    icon: Upload,
    iconBg: "bg-emerald-50 text-emerald-600",
  },
  {
    id: 4,
    type: "payment",
    title: "Payment",
    body: "Payment received GHC 250 from Esi Mensah",
    time: "5 hours ago",
    unread: true,
    icon: Banknote,
    iconBg: "bg-violet-50 text-violet-600",
  },
];

export default function AdminDashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const notifRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotificationOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setMobileSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const filteredClients = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    return MOCK_CLIENTS.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.address.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  }

  function markOneRead(id) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  }

  const stats = [
    {
      label: "Total Bookings",
      value: "128",
      sub: "+12 this month",
      icon: Calendar,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Pending",
      value: "18",
      sub: "Awaiting confirmation",
      icon: Clock,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "Confirmed",
      value: "92",
      sub: "Scheduled",
      icon: TrendingUp,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Revenue (GHC)",
      value: "3,240",
      sub: "+12.5% vs last month",
      icon: Banknote,
      color: "bg-violet-50 text-violet-600",
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Dashboard</h1>
          <p className="text-sm text-slate-500">Overview of laboratory operations</p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative" ref={searchRef}>
            <button
              type="button"
              className="sm:hidden rounded-xl border border-slate-200 bg-white p-2.5"
              onClick={() => setMobileSearchOpen((v) => !v)}
              aria-label="Search"
            >
              <Search className="h-4 w-4 text-slate-600" />
            </button>

            <div
              className={`${
                mobileSearchOpen
                  ? "absolute right-0 top-full z-30 mt-2 w-[min(320px,calc(100vw-2rem))]"
                  : "hidden"
              } sm:relative sm:block sm:w-64`}
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search bookings, clients..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-8 text-sm outline-none focus:border-[#2563EB] shadow-sm sm:shadow-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {searchQuery.trim() && (
                <div className="absolute left-0 right-0 top-full z-40 mt-1 max-h-72 overflow-y-auto rounded-xl border border-slate-100 bg-white shadow-lg">
                  {filteredClients.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-slate-500">No clients match “{searchQuery}”</p>
                  ) : (
                    filteredClients.map((c) => (
                      <Link
                        key={c.name + c.address}
                        href="/admin/clients"
                        className="block border-b border-slate-50 px-4 py-3 last:border-0 hover:bg-slate-50"
                        onClick={() => {
                          setSearchQuery("");
                          setMobileSearchOpen(false);
                        }}
                      >
                        <p className="text-sm font-medium text-[#0F172A]">{c.name}</p>
                        <p className="text-xs text-slate-500">{c.address}</p>
                        <p className="mt-0.5 text-[11px] text-slate-400">
                          {c.date} · {c.status}
                        </p>
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setIsNotificationOpen((v) => !v)}
              className="relative rounded-xl border border-slate-200 bg-white p-2.5 hover:bg-slate-50"
              aria-label="Notifications"
              aria-expanded={isNotificationOpen}
            >
              <Bell className="h-4 w-4 text-slate-600" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
              )}
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-[min(380px,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <h3 className="text-sm font-bold text-[#0F172A]">
                    Notifications{" "}
                    {unreadCount > 0 && (
                      <span className="font-medium text-slate-500">({unreadCount} new)</span>
                    )}
                  </h3>
                  <button
                    type="button"
                    onClick={markAllRead}
                    className="text-xs font-medium text-[#2563EB] hover:underline"
                  >
                    Mark all as read
                  </button>
                </div>
                <ul className="max-h-80 overflow-y-auto">
                  {notifications.map((n) => (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => markOneRead(n.id)}
                        className="flex w-full gap-3 border-b border-slate-50 px-4 py-3 text-left last:border-0 hover:bg-slate-50"
                      >
                        <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${n.iconBg}`}>
                          <n.icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-semibold text-slate-500">{n.title}</p>
                            {n.unread && (
                              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#2563EB]" />
                            )}
                          </div>
                          <p className="text-sm font-medium text-[#0F172A] leading-snug">{n.body}</p>
                          <p className="mt-0.5 text-[11px] text-slate-400">{n.time}</p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <Link
            href="/admin/bookings?new=1"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-3 sm:px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-600"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Booking</span>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-slate-500">{s.label}</span>
              <div className={`rounded-xl p-2 ${s.color}`}>
                <s.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="text-3xl font-bold text-[#0F172A]">{s.value}</p>
            <p className="mt-1 text-xs text-emerald-600">{s.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
