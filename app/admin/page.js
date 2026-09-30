"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";
import { getLocal } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const b = getLocal("bookings", []);
    setBookings(
      b.length
        ? b
        : [
            {
              id: 1,
              clientName: "Ama Boateng",
              address: "12 Spintex Road, Accra",
              tests: ["PCR Test", "Blood Panel"],
              date: "Oct 14, 2024",
              time: "09:30 AM",
              status: "Pending",
            },
            {
              id: 2,
              clientName: "Kwame Asamoah",
              address: "45 Oxford St, Kumasi",
              tests: ["COVID Test"],
              date: "Oct 13, 2024",
              time: "11:00 AM",
              status: "Confirmed",
            },
            {
              id: 3,
              clientName: "Esi Mensah",
              address: "22 Ringway Rd, Tema",
              tests: ["Full Blood Count"],
              date: "Oct 13, 2024",
              time: "02:45 PM",
              status: "Awaiting Sample",
            },
          ]
    );
  }, []);

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

  function statusBadge(status) {
    const map = {
      Pending: "bg-amber-100 text-amber-700",
      Confirmed: "bg-emerald-100 text-emerald-700",
      "Awaiting Sample": "bg-blue-100 text-blue-700",
      Ready: "bg-green-100 text-green-700",
    };
    return map[status] || "bg-slate-100 text-slate-600";
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Dashboard</h1>
          <p className="text-sm text-slate-500">
            Overview of laboratory operations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Search bookings, clients..."
              className="w-64 rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-[#2563EB]"
            />
          </div>
          <button className="relative rounded-xl border border-slate-200 bg-white p-2.5">
            <Bell className="h-4 w-4 text-slate-600" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
          </button>
          <Link
            href="/admin/bookings"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-600"
          >
            <Plus className="h-4 w-4" /> New Booking
          </Link>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-[#0F172A]">Recent Bookings</h2>
          <Link href="/admin/bookings" className="text-sm font-medium text-[#2563EB]">
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-xs uppercase tracking-wide text-slate-400">
                <th className="pb-3 pr-4 font-medium">Client</th>
                <th className="pb-3 pr-4 font-medium">Address</th>
                <th className="pb-3 pr-4 font-medium">Tests</th>
                <th className="pb-3 pr-4 font-medium">Date / Time</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.slice(0, 5).map((b) => (
                <tr key={b.id} className="border-b border-slate-50 last:border-0">
                  <td className="py-3.5 pr-4 font-medium text-[#0F172A]">
                    {b.clientName}
                  </td>
                  <td className="py-3.5 pr-4 text-slate-500">{b.address}</td>
                  <td className="py-3.5 pr-4">
                    <div className="flex flex-wrap gap-1">
                      {(Array.isArray(b.tests) ? b.tests : [b.tests]).map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-[#2563EB]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 pr-4 text-slate-600">
                    {b.date || "—"} · {b.time}
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusBadge(
                        b.status
                      )}`}
                    >
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
