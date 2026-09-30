"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Bell,
  Plus,
  Users,
  UserCheck,
  UserPlus,
  MapPin,
} from "lucide-react";
import { useToast } from "@/components/ToastProvider";

const CLIENTS = [
  {
    id: 1,
    name: "Kwame Boateng",
    tag: "VIP · Regular",
    phone: "+233 24 567 8901",
    email: "kwame.b@email.com",
    location: "Accra",
    bookings: 12,
    lastVisit: "Sep 25, 2025",
    color: "bg-blue-500",
  },
  {
    id: 2,
    name: "Ama Serwaa",
    tag: "+233 20 444 3321",
    phone: "+233 20 444 3321",
    email: "ama.serwaa@email.com",
    location: "Kumasi",
    bookings: 7,
    lastVisit: "Sep 22, 2025",
    color: "bg-emerald-500",
  },
  {
    id: 3,
    name: "Joseph Mensah",
    tag: "+233 55 789 1123",
    phone: "+233 55 789 1123",
    email: "j.mensah@email.com",
    location: "Tema",
    bookings: 18,
    lastVisit: "Sep 27, 2025",
    color: "bg-violet-500",
  },
  {
    id: 4,
    name: "Efua Darko",
    tag: "VIP · 53 909 7745",
    phone: "+233 24 909 7745",
    email: "efua.d@email.com",
    location: "Accra",
    bookings: 5,
    lastVisit: "Sep 21, 2025",
    color: "bg-orange-500",
  },
  {
    id: 5,
    name: "Kojo Appiah",
    tag: "+233 50 332 6690",
    phone: "+233 50 332 6690",
    email: "kojo.appiah@email.com",
    location: "Kumasi",
    bookings: 9,
    lastVisit: "Sep 24, 2025",
    color: "bg-cyan-500",
  },
];

const LOC_COLOR = {
  Accra: "text-blue-600",
  Kumasi: "text-emerald-600",
  Tema: "text-violet-600",
};

export default function AdminClientsPage() {
  const { showToast } = useToast();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    if (!q) return CLIENTS;
    const s = q.toLowerCase();
    return CLIENTS.filter(
      (c) =>
        c.name.toLowerCase().includes(s) ||
        c.email.toLowerCase().includes(s) ||
        c.phone.includes(s) ||
        c.location.toLowerCase().includes(s)
    );
  }, [q]);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
        <span>Clients</span>
        <span className="flex items-center gap-3">
          <Bell className="h-4 w-4" />
          Mon, 29 Sep 2025 · 09:12 AM
        </span>
      </div>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Clients Management</h1>
          <p className="text-sm text-slate-500">
            Manage your clients and their laboratory service history
          </p>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-blue-50 p-5">
          <div className="mb-2 flex items-center gap-2 text-blue-600">
            <Users className="h-5 w-5" />
            <span className="text-sm font-medium">Total Clients</span>
          </div>
          <p className="text-4xl font-bold text-[#0F172A]">248</p>
          <p className="mt-1 text-xs text-emerald-600">↑ 12% vs last month</p>
        </div>
        <div className="rounded-2xl bg-emerald-50 p-5">
          <div className="mb-2 flex items-center gap-2 text-emerald-600">
            <UserCheck className="h-5 w-5" />
            <span className="text-sm font-medium">Active</span>
          </div>
          <p className="text-4xl font-bold text-[#0F172A]">198</p>
          <p className="mt-1 text-xs text-emerald-600">↑ 8% vs last month</p>
        </div>
        <div className="rounded-2xl bg-amber-50 p-5">
          <div className="mb-2 flex items-center gap-2 text-amber-600">
            <UserPlus className="h-5 w-5" />
            <span className="text-sm font-medium">New this week</span>
          </div>
          <p className="text-4xl font-bold text-[#0F172A]">15</p>
          <p className="mt-1 text-xs text-emerald-600">↑ 5 vs last week</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-[#0F172A]">All Clients</h2>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search clients..."
                className="w-64 rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#2563EB]"
              />
            </div>
            <button
              type="button"
              onClick={() => showToast("Add client form")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" /> Add Client
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-xs uppercase tracking-wide text-slate-400">
                <th className="pb-3 pr-3 font-medium">Client Name</th>
                <th className="pb-3 pr-3 font-medium">Phone</th>
                <th className="pb-3 pr-3 font-medium">Email</th>
                <th className="pb-3 pr-3 font-medium">Location</th>
                <th className="pb-3 pr-3 font-medium">Total Bookings</th>
                <th className="pb-3 pr-3 font-medium">Last Visit</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-slate-50 last:border-0">
                  <td className="py-3.5 pr-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white ${c.color}`}
                      >
                        {c.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-[#0F172A]">{c.name}</p>
                        <p className="text-xs text-slate-400">{c.tag}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 pr-3 text-slate-600">{c.phone}</td>
                  <td className="py-3.5 pr-3 text-slate-600">{c.email}</td>
                  <td className="py-3.5 pr-3">
                    <span className={`inline-flex items-center gap-1 text-sm font-medium ${LOC_COLOR[c.location] || "text-slate-600"}`}>
                      <MapPin className="h-3.5 w-3.5" /> {c.location}
                    </span>
                  </td>
                  <td className="py-3.5 pr-3 font-medium text-[#0F172A]">{c.bookings}</td>
                  <td className="py-3.5 pr-3 text-slate-600">{c.lastVisit}</td>
                  <td className="py-3.5">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => showToast(`View ${c.name}`)}
                        className="rounded-lg border border-blue-200 px-2.5 py-1 text-xs font-medium text-[#2563EB] hover:bg-blue-50"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => showToast(`Edit ${c.name}`)}
                        className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <span>Showing 1–{filtered.length} of 248 clients · Updated just now</span>
          <div className="flex items-center gap-1">
            <button className="rounded-lg border px-2.5 py-1">Previous</button>
            <button className="rounded-lg bg-[#2563EB] px-2.5 py-1 text-white">1</button>
            <button className="rounded-lg border px-2.5 py-1">2</button>
            <button className="rounded-lg border px-2.5 py-1">3</button>
            <button className="rounded-lg border px-2.5 py-1">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
